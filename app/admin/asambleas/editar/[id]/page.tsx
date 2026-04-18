'use client';

import { useState, FormEvent, useEffect } from 'react';
import ToastNotice from '@/app/components/general/ToastNotice';
import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { getById as getAssemblyById, update as updateAssembly } from '@/app/services/assemblies.service';
import {
  create as createAgenda,
  getAll as getAgendaByAssembly,
  update as updateAgenda,
  remove as removeAgenda,
} from '@/app/services/agenda.service';
import {
  create as createVotingQuestion,
  getAll as getVotingQuestionsByAgenda,
  update as updateVotingQuestion,
} from '@/app/services/voting-questions.service';
import {
  create as createQuestionOption,
  getAll as getQuestionOptionsByQuestion,
  update as updateQuestionOption,
} from '@/app/services/question-options.service';
import { Assembly } from '@/app/types/assemblies';
import { Agenda } from '@/app/types/agenda';
import { VotingQuestions } from '@/app/types/voting-questions';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { AgendaItem } from '@/app/types/agenda';
import { AssemblyFormData } from '@/app/types/assemblies';
import { Option } from '@/app/types/question-options';
import { VotingQuestion } from '@/app/types/voting-questions';
import { normalizeAgendaSortOrder } from '../../_types';
import AssemblyInfoForm from '../../components/AssemblyInfoForm';
import AgendaBuilder from '../../components/AgendaBuilder';
import { useProperty } from '@/app/context/PropertyContext';

const getListFromResponse = <T,>(response: any): T[] => {
  if (Array.isArray(response?.data)) return response.data as T[];
  if (Array.isArray(response)) return response as T[];
  return [];
};

const getIdFromResponse = (response: any): string | undefined =>
  response?.data?.id || response?.id;

export default function EditarAsambleasPage() {
  const { selectedPropertyId } = useProperty();
  const router = useRouter();
  const params = useParams();
  const assemblyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<AssemblyFormData>({
    name: '',
    description: '',
    type: 'Ordinaria',
    status: 'scheduled',
    scheduled_at: '',
    quorum_requirement: 50,
    is_active: true,
    phs_id: '',
  });

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [originalAgendaItems, setOriginalAgendaItems] = useState<AgendaItem[]>([]);

  useEffect(() => {
    if (assemblyId) {
      loadAssembly(assemblyId);
    }
  }, [assemblyId]);

  const loadAssembly = async (id: string) => {
    try {
      setLoading(true);
      
      // Cargar datos de la asamblea
      const assemblyResponse = await getAssemblyById(id);
      const assembly = assemblyResponse.data;
      
      // Convertir la fecha para el input datetime-local
      let scheduledAt = '';
      if (assembly.scheduled_at) {
        const date = new Date(assembly.scheduled_at);
        scheduledAt = date.toISOString().slice(0, 16);
      }

      setFormData({
        name: assembly.name || '',
        description: assembly.description || '',
        type: assembly.type || 'Ordinaria',
        status: assembly.status || 'scheduled',
        scheduled_at: scheduledAt,
        quorum_requirement: assembly.quorum_requirement || 50,
        is_active: assembly.is_active ?? true,
        phs_id: assembly.phs_id || ''
      });

      // Cargar los puntos de agenda
      const agendaResponse = await getAgendaByAssembly({ 
        where: `assembly_id=${id}`, 
        limit: '100' 
      });

      const agendaList = getListFromResponse<any>(agendaResponse);

      if (agendaList.length > 0) {
        // Fetch all voting questions for all agenda items in parallel
        const questionsPerAgenda = await Promise.all(
          agendaList.map(async (agendaItem: any) => {
            if (!agendaItem.id) return [];
            try {
              const resp = await getVotingQuestionsByAgenda({
                where: `agenda_id=${agendaItem.id}`,
                limit: '50'
              });
              return getListFromResponse<any>(resp);
            } catch {
              return [];
            }
          })
        );

        // Fetch all options for all questions in parallel
        const allQuestions = questionsPerAgenda.flat();
        const optionsMap = new Map<string, Option[]>();

        if (allQuestions.length > 0) {
          const optionsResults = await Promise.all(
            allQuestions.map(async (q: any) => {
              if (!q.id) return { id: q.id, options: [] as Option[] };
              try {
                const resp = await getQuestionOptionsByQuestion({
                  where: `question_id=${q.id}`,
                  limit: '50'
                });
                const optionList = getListFromResponse<any>(resp);
                return {
                  id: q.id,
                  options: optionList.map((opt: any) => ({
                    id: opt.id,
                    text: opt.option_text || opt.optionText || ''
                  }))
                };
              } catch {
                return { id: q.id, options: [] as Option[] };
              }
            })
          );
          for (const { id, options } of optionsResults) {
            optionsMap.set(id, options);
          }
        }

        // Build agenda items with pre-fetched data
        const items: AgendaItem[] = agendaList.map((agendaItem: any, idx: number) => {
          const item: AgendaItem = {
            id: agendaItem.id,
            assembly_id: agendaItem.assembly_id,
            title: agendaItem.title,
            sort_order: agendaItem.sort_order,
            is_votable: agendaItem.is_votable,
            required_quorum: agendaItem.required_quorum,
            is_active: agendaItem.is_active,
            type: agendaItem.is_votable ? 'Encuesta' : 'Texto'
          };

          const questionList = questionsPerAgenda[idx];
          if (questionList.length > 0) {
            item.votingQuestions = questionList.map((q: any) => ({
              id: q.id,
              question_text: q.question_text,
              description: q.description || '',
              type: q.type || 'simple',
              result_type: q.result_type || 'relative_majority',
              min_selections: q.min_selections || 1,
              max_selections: q.max_selections || 1,
              options: optionsMap.get(q.id) || []
            }));
            item.type = 'Encuesta';
            item.is_votable = true;
          }

          return item;
        });

        const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
        const normalized = normalizeAgendaSortOrder(sortedItems);
        setAgendaItems(normalized);
        setOriginalAgendaItems(JSON.parse(JSON.stringify(normalized)));
      }

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los datos de la asamblea' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const removeAgendaItem = async (index: number) => {
    const item = agendaItems[index];

    if (item.id) {
      try {
        await removeAgenda(item.id);
      } catch (error) {
        console.error('Error al eliminar punto de agenda:', error);
        alert('Error al eliminar el punto de agenda');
        return;
      }
    }

    const remainingItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(normalizeAgendaSortOrder(remainingItems));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const scheduledAt = formData.scheduled_at
        ? new Date(formData.scheduled_at).toISOString()
        : new Date().toISOString();

      const assemblyPayload: Partial<Assembly> = {
        ...formData,
        scheduled_at: scheduledAt,
        phs_id: formData.phs_id || selectedPropertyId || '',
        quorum_requirement: Number(formData.quorum_requirement) || 50,
      };

      await updateAssembly(assemblyId, assemblyPayload);

      const normalizedAgendaItems = normalizeAgendaSortOrder(agendaItems);

      // Process all agenda items in parallel
      await Promise.all(normalizedAgendaItems.map(async (item) => {
        let agendaId: string;

        if (item.id) {
          // Update existing agenda item
          const agendaPayload: Partial<Agenda> = {
            assembly_id: assemblyId,
            title: item.title,
            sort_order: item.sort_order,
            is_votable: item.is_votable,
            required_quorum: Number(item.required_quorum) || 50,
            is_active: item.is_active,
          };
          await updateAgenda(item.id, agendaPayload);
          agendaId = item.id;
        } else {
          // Create new agenda item
          const agendaPayload: Partial<Agenda> = {
            assembly_id: assemblyId,
            title: item.title,
            sort_order: item.sort_order,
            is_votable: item.is_votable,
            required_quorum: item.required_quorum,
            is_active: item.is_active,
          };
          const agendaResponse = await createAgenda(agendaPayload as Agenda);
          const newId = getIdFromResponse(agendaResponse);
          if (!newId) throw new Error('No se recibió el id de la agenda creada.');
          agendaId = newId;
        }

        // Process voting questions in parallel
        if (item.votingQuestions && item.votingQuestions.length > 0) {
          await Promise.all(item.votingQuestions.map(async (question) => {
            let questionId = question.id;

            if (question.id) {
              const questionPayload: Partial<VotingQuestions> = {
                agenda_id: agendaId,
                question_text: question.question_text,
                description: question.description,
                type: question.type,
                result_type: question.result_type,
                min_selections: question.min_selections,
                max_selections: question.max_selections,
              };
              try {
                await updateVotingQuestion(question.id, questionPayload);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '';
                if (errorMessage.includes('NO_ENCONTRADA')) {
                  const createdQuestion = await createVotingQuestion({
                    ...questionPayload,
                    is_active: true,
                    status: 'pending',
                  } as VotingQuestions);
                  questionId = getIdFromResponse(createdQuestion);
                  if (!questionId) throw new Error('No se recibió el id de la pregunta recreada.');
                } else {
                  throw error;
                }
              }
            } else {
              const questionPayload: Partial<VotingQuestions> = {
                agenda_id: agendaId,
                question_text: question.question_text,
                description: question.description,
                type: question.type,
                result_type: question.result_type,
                min_selections: question.min_selections,
                max_selections: question.max_selections,
                is_active: true,
                status: 'pending',
              };
              const questionResponse = await createVotingQuestion(questionPayload as VotingQuestions);
              questionId = getIdFromResponse(questionResponse);
              if (!questionId) throw new Error('No se recibió el id de la pregunta creada.');
            }

            if (!questionId) throw new Error('No se encontró el id de la pregunta para procesar opciones.');

            // Process options in parallel
            await Promise.all(question.options.map(async (opt, i) => {
              if (opt.id) {
                await updateQuestionOption(opt.id, {
                  question_id: questionId!,
                  option_text: opt.text,
                  order_index: i,
                });
              } else if (opt.text.trim()) {
                await createQuestionOption({
                  question_id: questionId!,
                  option_text: opt.text,
                  order_index: i,
                  is_active: true,
                });
              }
            }));
          }));
        }
      }));

      // Deactivate removed questions and options
      const currentQuestionIds = new Set(
        normalizedAgendaItems.flatMap(item =>
          (item.votingQuestions || []).filter(q => q.id).map(q => q.id!)
        )
      );
      const currentOptionIds = new Set(
        normalizedAgendaItems.flatMap(item =>
          (item.votingQuestions || []).flatMap(q =>
            q.options.filter(o => o.id).map(o => o.id!)
          )
        )
      );

      const deactivations: Promise<any>[] = [];

      for (const origItem of originalAgendaItems) {
        if (!origItem.votingQuestions) continue;
        for (const origQ of origItem.votingQuestions) {
          if (origQ.id && !currentQuestionIds.has(origQ.id)) {
            deactivations.push(
              updateVotingQuestion(origQ.id, {
                agenda_id: origItem.id,
                question_text: origQ.question_text,
                is_active: false,
              } as Partial<VotingQuestions>)
            );
          } else if (origQ.id) {
            for (const origOpt of origQ.options) {
              if (origOpt.id && !currentOptionIds.has(origOpt.id)) {
                deactivations.push(
                  updateQuestionOption(origOpt.id, {
                    question_id: origQ.id,
                    option_text: origOpt.text,
                    is_active: false,
                  })
                );
              }
            }
          }
        }
      }

      if (deactivations.length > 0) {
        await Promise.all(deactivations);
      }

      setMessage({ type: 'success', text: 'Asamblea actualizada exitosamente' });
      
      setTimeout(() => {
        router.push('/admin/asambleas');
      }, 1500);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar la asamblea' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div className={styles.loadingMessage}>Cargando datos de la asamblea...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit}>
          <div className={styles.asambleaConfigContainer}>
            <AssemblyInfoForm
              formData={formData}
              onChange={handleChange}
              onToggleActive={(checked) => setFormData({ ...formData, is_active: checked })}
              title="Editar Asamblea"
              showStatus
            />
            <AgendaBuilder
              agendaItems={agendaItems}
              onAgendaItemsChange={setAgendaItems}
              onRemoveAgendaItem={removeAgendaItem}
              showSavedBadge
            />
          </div>

          <div className={styles.formActionsBar}>
            <Link href="/admin/asambleas" className={styles.btnCancelLarge}>
              Cancelar
            </Link>
            <button type="submit" disabled={saving} className={styles.btnSubmitLarge}>
              {saving ? 'Guardando...' : 'Actualizar Asamblea'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
