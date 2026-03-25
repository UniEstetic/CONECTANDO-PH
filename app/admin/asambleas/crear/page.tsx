'use client';

import { useState, FormEvent } from 'react';
import ToastNotice from '@/app/components/general/ToastNotice';
import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { create as createAssembly } from '@/app/services/assemblies.service';
import { create as createAgenda } from '@/app/services/agenda.service';
import { create as createVotingQuestion } from '@/app/services/voting-questions.service';
import { create as createQuestionOption } from '@/app/services/question-options.service';
import { Assembly } from '@/app/types/assemblies';
import { Agenda } from '@/app/types/agenda';
import { VotingQuestions } from '@/app/types/voting-questions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AgendaItem } from '@/app/types/agenda';
import { AssemblyFormData } from '@/app/types/assemblies';
import { normalizeAgendaSortOrder } from '../_types';
import AssemblyInfoForm from '../components/AssemblyInfoForm';
import AgendaBuilder from '../components/AgendaBuilder';

export default function CrearAsambleasPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<AssemblyFormData>({
    name: '',
    description: '',
    type: 'Ordinaria',
    status: 'scheduled',
    scheduled_at: '',
    quorum_requirement: 50,
    is_active: true,
    phs_id: session?.user?.ownership?.id || '',
  });

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(normalizeAgendaSortOrder(agendaItems.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const scheduledAt = formData.scheduled_at
        ? new Date(formData.scheduled_at).toISOString()
        : new Date().toISOString();

      const assemblyPayload: Partial<Assembly> = {
        ...formData,
        scheduled_at: scheduledAt,
        phs_id: session?.user?.ownership?.id || formData.phs_id || '',
        livekit_room_name: `assembly-${Date.now()}`,
        quorum_requirement: Number(formData.quorum_requirement) || 50,
      };

      const assemblyResponse = await createAssembly(assemblyPayload);
      const assemblyId = assemblyResponse.data.id;

      // Create all agenda items and their nested data in parallel
      await Promise.all(agendaItems.map(async (item) => {
        const agendaPayload: Partial<Agenda> = {
          assembly_id: assemblyId,
          title: item.title,
          sort_order: item.sort_order,
          is_votable: item.is_votable,
          required_quorum: item.required_quorum,
          is_active: true,
        };

        const agendaResponse = await createAgenda(agendaPayload as Agenda);
        const agendaId = agendaResponse.data.id;

        if (!agendaId) {
          throw new Error('No se recibio el id de la agenda creada.');
        }

        if (item.votingQuestions && item.votingQuestions.length > 0) {
          // Create all questions for this agenda item in parallel
          await Promise.all(item.votingQuestions.map(async (question) => {
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
            const questionId = questionResponse.data.id;

            if (!questionId) {
              throw new Error('No se recibio el id de la pregunta creada.');
            }

            // Create all options for this question in parallel
            await Promise.all(question.options.map((opt, i) =>
              createQuestionOption({
                question_id: questionId,
                option_text: opt.text,
                order_index: i,
                is_active: true,
              })
            ));
          }));
        }
      }));

      setMessage({ type: 'success', text: 'Asamblea creada exitosamente' });
      setTimeout(() => router.push('/admin/asambleas'), 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al crear la asamblea',
      });
    } finally {
      setLoading(false);
    }
  };

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
            />
            <AgendaBuilder
              agendaItems={agendaItems}
              onAgendaItemsChange={setAgendaItems}
              onRemoveAgendaItem={removeAgendaItem}
            />
          </div>

          <div className={styles.formActionsBar}>
            <Link href="/admin/asambleas" className={styles.btnCancelLarge}>
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className={styles.btnSubmitLarge}>
              {loading ? 'Guardando...' : 'Crear Asamblea'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
