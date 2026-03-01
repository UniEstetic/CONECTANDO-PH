'use client';

import { useState, FormEvent, useEffect } from 'react';
import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { getById as getAssemblyById, update as updateAssembly } from '@/app/services/assemblies.service';
import { 
  create as createAgenda, 
  getAll as getAgendaByAssembly, 
  update as updateAgenda,
  remove as removeAgenda 
} from '@/app/services/agenda.service';
import { 
  create as createVotingQuestion, 
  getAll as getVotingQuestionsByAgenda,
  update as updateVotingQuestion,
  remove as removeVotingQuestion
} from '@/app/services/voting-questions.service';
import { 
  create as createQuestionOption, 
  getAll as getQuestionOptionsByQuestion, 
  update as updateQuestionOption, 
  remove as removeQuestionOption 
} from '@/app/services/question-options.service';
import { Assembly } from '@/app/types/assemblies';
import { Agenda } from '@/app/types/agenda';
import { VotingQuestions } from '@/app/types/voting-questions';
import { QuestionOptions } from '@/app/types/question-options';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from "next-auth/react";

type Option = {
  id?: string;
  text: string;
};

type VotingQuestion = {
  id?: string;
  question_text: string;
  description: string;
  type: string;
  result_type: string;
  min_selections: number;
  max_selections: number;
  options: Option[];
};

type AgendaItem = {
  id?: string;
  assembly_id: string;
  title: string;
  sort_order: number;
  is_votable: boolean;
  required_quorum: number;
  is_active: boolean;
  type: 'Encuesta' | 'Documento' | 'Texto';
  votingQuestions?: VotingQuestion[];
};

type AssemblyFormData = Partial<Assembly>

export default function EditarAsambleasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const assemblyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState<AssemblyFormData>({
    name: '',
    description: '',
    type: 'Ordinaria',
    status: 'scheduled',
    scheduled_at: '',
    quorum_requirement: 50,
    is_active: true,
    phs_id: ''
  });

  // Estado para los puntos de agenda
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<AgendaItem>>({
    title: '',
    is_votable: false,
    required_quorum: 50,
    type: 'Texto'
  });

  // Estado para preguntas de votación
  const [showVotingForm, setShowVotingForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<VotingQuestion>>({
    question_text: '',
    description: '',
    type: 'simple',
    result_type: 'relative_majority',
    min_selections: 1,
    max_selections: 1,
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }]
  });
  const [agendaQuestions, setAgendaQuestions] = useState<VotingQuestion[]>([]);

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
      
      if (agendaResponse.data && agendaResponse.data.length > 0) {
        const items: AgendaItem[] = [];
        
        for (const agendaItem of agendaResponse.data) {
          const item: AgendaItem = {
            id: agendaItem.id,
            assembly_id: agendaItem.assembly_id,
            title: agendaItem.title,
            sort_order: agendaItem.sort_order,
            is_votable: agendaItem.is_votable,
            required_quorum: agendaItem.required_quorum,
            is_active: agendaItem.is_active,
            type: 'Texto'
          };

          // Cargar preguntas de votación si es votable
          if (agendaItem.is_votable && agendaItem.id) {
            try {
              const questionsResponse = await getVotingQuestionsByAgenda({
                where: `agenda_id=${agendaItem.id}`,
                limit: '50'
              });
              
              if (questionsResponse.data && questionsResponse.data.length > 0) {
                const questions: VotingQuestion[] = [];
                for (const q of questionsResponse.data) {
                  // Cargar las opciones de la pregunta
                  let questionOptions: Option[] = [];
                  try {
                    const optionsResponse = await getQuestionOptionsByQuestion({
                      where: `question_id=${q.id}`,
                      limit: '50'
                    });
                    if (optionsResponse.data) {
                      questionOptions = optionsResponse.data.map(opt => ({
                        id: opt.id,
                        text: opt.option_text
                      }));
                    }
                  } catch (e) {
                    console.log('No hay opciones para esta pregunta');
                  }

                  questions.push({
                    id: q.id,
                    question_text: q.question_text,
                    description: q.description || '',
                    type: q.type || 'simple',
                    result_type: q.result_type || 'relative_majority',
                    min_selections: q.min_selections || 1,
                    max_selections: q.max_selections || 1,
                    options: questionOptions
                  });
                }
                item.votingQuestions = questions;
                item.type = 'Encuesta';
              }
            } catch (e) {
              console.log('No hay preguntas para esta agenda');
            }
          }

          items.push(item);
        }
        
        setAgendaItems(items);
      }

    } catch (error) {
      console.error('Error al cargar la asamblea:', error);
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

  const addAgendaItem = () => {
    if (!currentItem.title?.trim()) {
      alert('Por favor ingresa un título para el punto');
      return;
    }

    const newItem: AgendaItem = {
      assembly_id: assemblyId,
      title: currentItem.title,
      sort_order: editingAgendaIndex !== null ? editingAgendaIndex + 1 : agendaItems.length + 1,
      is_votable: currentItem.is_votable || false,
      required_quorum: Number(currentItem.required_quorum) || 50,
      is_active: true,
      type: currentItem.type as 'Encuesta' | 'Documento' | 'Texto',
      votingQuestions: currentItem.type === 'Encuesta' ? [...agendaQuestions] : undefined
    };

    if (editingAgendaIndex !== null) {
      // Actualizar punto existente
      const updatedItems = [...agendaItems];
      updatedItems[editingAgendaIndex] = newItem;
      setAgendaItems(updatedItems);
      setEditingAgendaIndex(null);
    } else {
      // Agregar nuevo punto
      setAgendaItems([...agendaItems, newItem]);
    }
    
    setCurrentItem({
      title: '',
      is_votable: false,
      required_quorum: 50,
      type: 'Texto'
    });
    setAgendaQuestions([]);
    setShowVotingForm(false);
  };

  const removeAgendaItem = async (index: number) => {
    const item = agendaItems[index];
    
    // Si el item ya existe en el backend (tiene id), eliminarlo
    if (item.id) {
      try {
        await removeAgenda(item.id);
      } catch (error) {
        console.error('Error al eliminar punto de agenda:', error);
        alert('Error al eliminar el punto de agenda');
        return;
      }
    }
    
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const addVotingQuestion = () => {
    if (!currentQuestion.question_text?.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    const validOptions = currentQuestion.options?.filter(o => o.text.trim()) || [];
    if (validOptions.length < 2) {
      alert('Debes agregar al menos 2 opciones');
      return;
    }

    const newQuestion: VotingQuestion = {
      question_text: currentQuestion.question_text,
      description: currentQuestion.description || '',
      type: currentQuestion.type || 'simple',
      result_type: currentQuestion.result_type || 'relative_majority',
      min_selections: Number(currentQuestion.min_selections) || 1,
      max_selections: Number(currentQuestion.max_selections) || 1,
      options: validOptions
    };

    setAgendaQuestions([...agendaQuestions, newQuestion]);
    setCurrentQuestion({
      question_text: '',
      description: '',
      type: 'simple',
      result_type: 'relative_majority',
      min_selections: 1,
      max_selections: 1,
      options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }]
    });
  };

  const removeVotingQuestion = (index: number) => {
    setAgendaQuestions(agendaQuestions.filter((_, i) => i !== index));
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = { text };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({ 
      ...currentQuestion, 
      options: [...(currentQuestion.options || []), { text: '' }] 
    });
  };

  const removeOption = (index: number) => {
    const newOptions = (currentQuestion.options || []).filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  // Estado para edición de punto existente
  const [editingAgendaIndex, setEditingAgendaIndex] = useState<number | null>(null);

  const handleEditAgendaItem = (index: number) => {
    const item = agendaItems[index];
    setCurrentItem({
      title: item.title,
      is_votable: item.is_votable,
      required_quorum: item.required_quorum,
      type: item.type
    });
    
    // Cargar las preguntas si es votable o tipo Encuesta
    if ((item.is_votable || item.type === 'Encuesta') && item.votingQuestions && item.votingQuestions.length > 0) {
      // Cargar las preguntas en el formulario de edición
      setAgendaQuestions(item.votingQuestions);
      setShowVotingForm(true);
    } else if (item.type === 'Encuesta') {
      // Es Encuesta pero no tiene preguntas, inicializar vacío
      setAgendaQuestions([]);
      setShowVotingForm(true);
    } else {
      setAgendaQuestions([]);
      setShowVotingForm(false);
    }
    
    setEditingAgendaIndex(index);
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
        quorum_requirement: Number(formData.quorum_requirement) || 50
      };

      // Actualizar la asamblea
      await updateAssembly(assemblyId, assemblyPayload);

      // Procesar cada punto de agenda
      for (const item of agendaItems) {
        // Si el punto ya existe, actualizarlo
        if (item.id) {
          const agendaPayload: Partial<Agenda> = {
            title: item.title,
            sort_order: item.sort_order,
            is_votable: item.is_votable,
            required_quorum: item.required_quorum,
            is_active: item.is_active
          };
          await updateAgenda(item.id, agendaPayload);

          // Procesar las preguntas de votación existentes
          if (item.votingQuestions && item.votingQuestions.length > 0) {
            for (const question of item.votingQuestions) {
              let questionId = question.id;
              
              if (question.id) {
                // Actualizar pregunta existente
                const questionPayload: Partial<VotingQuestions> = {
                  question_text: question.question_text,
                  description: question.description,
                  type: question.type,
                  result_type: question.result_type,
                  min_selections: question.min_selections,
                  max_selections: question.max_selections
                };
                await updateVotingQuestion(question.id, questionPayload);
                
                // Las opciones existentes se mantienen, las nuevas se crean
                // Por ahora solo procesamos las opciones que vienen en el array
                for (let i = 0; i < question.options.length; i++) {
                  const opt = question.options[i];
                  if (opt.id) {
                    // Opción existente - actualizar
                    await updateQuestionOption(opt.id, { 
                      option_text: opt.text, 
                      order_index: i 
                    });
                  } else if (opt.text.trim()) {
                    // Nueva opción - crear
                    await createQuestionOption({
                      question_id: question.id,
                      option_text: opt.text,
                      order_index: i,
                      is_active: true
                    });
                  }
                }
              } else {
                // Nueva pregunta - crear
                const questionPayload: Partial<VotingQuestions> = {
                  agenda_id: item.id,
                  question_text: question.question_text,
                  description: question.description,
                  type: question.type,
                  result_type: question.result_type,
                  min_selections: question.min_selections,
                  max_selections: question.max_selections,
                  status: 'pending'
                };
                const questionResponse = await createVotingQuestion(questionPayload as VotingQuestions);
                questionId = questionResponse.data.id;
                
                // Crear las opciones de la nueva pregunta
                for (let i = 0; i < question.options.length; i++) {
                  const opt = question.options[i];
                  if (opt.text.trim()) {
                    await createQuestionOption({
                      question_id: questionId,
                      option_text: opt.text,
                      order_index: i,
                      is_active: true
                    });
                  }
                }
              }
            }
          }
        } else {
          // Nuevo punto - crear
          const agendaPayload: Partial<Agenda> = {
            assembly_id: assemblyId,
            title: item.title,
            sort_order: item.sort_order,
            is_votable: item.is_votable,
            required_quorum: item.required_quorum,
            is_active: item.is_active
          };
          
          const agendaResponse = await createAgenda(agendaPayload as Agenda);
          const agendaId = agendaResponse.data.id;

          // Si el punto tiene preguntas de votación, crearlas
          if (item.votingQuestions && item.votingQuestions.length > 0) {
            for (const question of item.votingQuestions) {
              const questionPayload: Partial<VotingQuestions> = {
                agenda_id: agendaId,
                question_text: question.question_text,
                description: question.description,
                type: question.type,
                result_type: question.result_type,
                min_selections: question.min_selections,
                max_selections: question.max_selections,
                status: 'pending'
              };

              const questionResponse = await createVotingQuestion(questionPayload as VotingQuestions);
              const questionId = questionResponse.data.id;

              // Crear las opciones de la pregunta
              for (let i = 0; i < question.options.length; i++) {
                const optionPayload: Partial<QuestionOptions> = {
                  question_id: questionId,
                  option_text: question.options[i].text,
                  order_index: i,
                  is_active: true
                };
                await createQuestionOption(optionPayload);
              }
            }
          }
        }
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
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'white',
            fontWeight: 500,
            fontSize: '18px'
          }}>
            Cargando datos de la asamblea...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />
        
        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center',
            fontWeight: 500,
            margin: '0 2rem 1rem 2rem'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.asambleasContainer}>
            {/* Sección izquierda - Información General */}
            <div className={styles.infoGeneralSection}>
              <div className={styles.sectionHeader}>
                <h2>Editar Asamblea</h2>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Título de asamblea:</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '26px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Descripción:</label>
                <textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="type">Tipo de asamblea:</label>
                <select 
                  id="type" 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option value="Ordinaria">Ordinaria</option>
                  <option value="Extraordinaria">Extraordinaria</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">Estado:</label>
                <select 
                  id="status" 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option value="scheduled">Programada</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="scheduled_at">Fecha y hora:</label>
                <div className={styles.inputWithIcon}>
                  <input 
                    type="datetime-local" 
                    id="scheduled_at" 
                    name="scheduled_at"
                    value={formData.scheduled_at}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid white',
                      borderRadius: '26px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="quorum_requirement">Quorum requerido (%):</label>
                <input 
                  type="number" 
                  id="quorum_requirement" 
                  name="quorum_requirement"
                  value={formData.quorum_requirement}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '26px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="is_active" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  Asamblea activa
                </label>
              </div>
            </div>

            {/* Sección derecha - Orden del día */}
            <div className={styles.ordenDiaSection}>
              <div className={styles.sectionHeader}>
                <h2>Orden del día</h2>
              </div>
              
              {/* Agregar nuevo punto */}
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#fff2d6', 
                borderRadius: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 600,
                    color: '#6b5b3e'
                  }}>
                    Agregar punto a la agenda:
                  </label>
                  <input 
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    placeholder="Título del punto"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ccc',
                      borderRadius: '20px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <select
                    value={currentItem.type}
                    onChange={(e) => {
                      setCurrentItem({ ...currentItem, type: e.target.value as any });
                      setShowVotingForm(e.target.value === 'Encuesta');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '15px',
                      border: '1px solid #ccc',
                      fontSize: '13px'
                    }}
                  >
                    <option value="Texto">Texto</option>
                    <option value="Encuesta">Encuesta</option>
                    <option value="Documento">Documento</option>
                  </select>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '13px',
                    color: '#6b5b3e'
                  }}>
                    <input 
                      type="checkbox"
                      checked={currentItem.is_votable}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_votable: e.target.checked })}
                    />
                    Votable
                  </label>

                  {currentItem.is_votable && (
                    <input 
                      type="number"
                      value={currentItem.required_quorum}
                      onChange={(e) => setCurrentItem({ ...currentItem, required_quorum: Number(e.target.value) })}
                      placeholder="Quorum %"
                      min="0"
                      max="100"
                      style={{
                        width: '80px',
                        padding: '6px 10px',
                        borderRadius: '15px',
                        border: '1px solid #ccc',
                        fontSize: '13px'
                      }}
                    />
                  )}
                </div>

                {/* Formulario de preguntas de votación */}
                {showVotingForm && (
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '12px', 
                    backgroundColor: '#e8f4f8', 
                    borderRadius: '10px',
                    border: '1px solid #3498db'
                  }}>
                    <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '10px' }}>
                      Preguntas de Votación
                    </div>

                    {agendaQuestions.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        {agendaQuestions.map((q, idx) => (
                          <div key={idx} style={{
                            backgroundColor: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            marginBottom: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '13px' }}>{q.question_text}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                {q.options.length} opciones
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVotingQuestion(idx)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginBottom: '10px' }}>
                      <input 
                        type="text"
                        value={currentQuestion.question_text}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                        placeholder="Texto de la pregunta"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '15px',
                          fontSize: '13px',
                          marginBottom: '8px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <textarea
                        value={currentQuestion.description}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, description: e.target.value })}
                        placeholder="Descripción (opcional)"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '15px',
                          fontSize: '13px',
                          marginBottom: '8px',
                          minHeight: '50px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                          style={{ padding: '6px 10px', borderRadius: '12px', fontSize: '12px' }}
                        >
                          <option value="simple">Simple</option>
                          <option value="multiple">Múltiple</option>
                        </select>
                        <select
                          value={currentQuestion.result_type}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, result_type: e.target.value })}
                          style={{ padding: '6px 10px', borderRadius: '12px', fontSize: '12px' }}
                        >
                          <option value="relative_majority">Mayoría relativa</option>
                          <option value="absolute_majority">Mayoría absoluta</option>
                          <option value="two_thirds">2/3 partes</option>
                        </select>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: '#2c3e50' }}>
                        Opciones de respuesta:
                      </div>
                      {currentQuestion.options?.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOptionText(idx, e.target.value)}
                            placeholder={`Opción ${idx + 1}`}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              border: '1px solid #ccc',
                              borderRadius: '12px',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                          {(currentQuestion.options?.length || 0) > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              X
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        style={{
                          marginTop: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        + Agregar opción
                      </button>
                      <button
                        type="button"
                        onClick={addVotingQuestion}
                        style={{
                          marginTop: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        + Agregar pregunta
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addAgendaItem}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#5b2d4e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editingAgendaIndex !== null ? 'Actualizar punto' : '+ Agregar punto'}
                </button>
                {editingAgendaIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAgendaIndex(null);
                      setCurrentItem({
                        title: '',
                        is_votable: false,
                        required_quorum: 50,
                        type: 'Texto'
                      });
                      setAgendaQuestions([]);
                      setShowVotingForm(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: '10px'
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Lista de puntos */}
              {agendaItems.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ 
                    color: 'white', 
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    Puntos en la agenda ({agendaItems.length}):
                  </h4>
                  
                  {agendaItems.map((item, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: '#fff2d6',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: 600, 
                            color: '#6b5b3e',
                            marginBottom: '4px'
                          }}>
                            {index + 1}. {item.title}
                            {item.id && (
                              <span style={{
                                fontSize: '10px',
                                backgroundColor: '#3498db',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                marginLeft: '8px'
                              }}>
                                Guardado
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b5b3e' }}>
                            <span style={{ 
                              backgroundColor: item.is_votable ? '#27ae60' : '#95a5a6',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              marginRight: '8px'
                            }}>
                              {item.type}
                            </span>
                            {item.is_votable && `Quorum: ${item.required_quorum}%`}
                            {item.votingQuestions && item.votingQuestions.length > 0 && (
                              <span style={{ 
                                backgroundColor: '#3498db',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                marginLeft: '8px'
                              }}>
                                {item.votingQuestions.length} pregunta(s)
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEditAgendaItem(index)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginRight: '6px'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {agendaItems.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: 'white',
                  fontStyle: 'italic'
                }}>
                  No hay puntos en la agenda. Agrega uno usando el formulario acima.
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginTop: '20px',
            paddingBottom: '40px'
          }}>
            <Link href="/admin/asambleas">
              <button 
                type="button"
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </Link>
            <button 
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 30px',
                backgroundColor: saving ? '#95a5a6' : '#5b2d4e',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Guardando...' : 'Actualizar Asamblea'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
