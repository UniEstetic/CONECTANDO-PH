'use client';

import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import { AgendaItem, VotingQuestion, EMPTY_CURRENT_ITEM, EMPTY_CURRENT_QUESTION } from '../_types';
import VotingQuestionsForm from './VotingQuestionsForm';
import { useState } from 'react';

type Props = {
  agendaItems: AgendaItem[];
  onAgendaItemsChange: (items: AgendaItem[]) => void;
  onRemoveAgendaItem: (index: number) => void;
  /** Whether to show "Guardado" badge on items with an id */
  showSavedBadge?: boolean;
};

export default function AgendaBuilder({
  agendaItems,
  onAgendaItemsChange,
  onRemoveAgendaItem,
  showSavedBadge = false,
}: Props) {
  const [currentItem, setCurrentItem] = useState<Partial<AgendaItem>>({ ...EMPTY_CURRENT_ITEM });
  const [showVotingForm, setShowVotingForm] = useState(false);
  const [agendaQuestions, setAgendaQuestions] = useState<VotingQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<VotingQuestion>>({ ...EMPTY_CURRENT_QUESTION });
  const [editingAgendaIndex, setEditingAgendaIndex] = useState<number | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const resetForm = () => {
    setCurrentItem({ ...EMPTY_CURRENT_ITEM });
    setAgendaQuestions([]);
    setShowVotingForm(false);
    setEditingAgendaIndex(null);
    setEditingQuestionIndex(null);
    setCurrentQuestion({ ...EMPTY_CURRENT_QUESTION });
  };

  const addAgendaItem = () => {
    if (!currentItem.title?.trim()) {
      alert('Por favor ingresa un título para el punto');
      return;
    }

    if (currentItem.type === 'Encuesta' && agendaQuestions.length === 0) {
      alert('Debes agregar al menos una pregunta para el tipo Encuesta');
      return;
    }

    const newItem: AgendaItem = {
      id: editingAgendaIndex !== null ? agendaItems[editingAgendaIndex]?.id : undefined,
      assembly_id: editingAgendaIndex !== null ? agendaItems[editingAgendaIndex]?.assembly_id : undefined,
      title: currentItem.title!,
      sort_order: 0,
      is_votable: currentItem.type === 'Encuesta' ? true : (currentItem.is_votable || false),
      required_quorum: Number(currentItem.required_quorum) || 50,
      is_active: editingAgendaIndex !== null ? agendaItems[editingAgendaIndex]?.is_active : true,
      type: currentItem.type as 'Encuesta' | 'Documento' | 'Texto',
      votingQuestions: currentItem.type === 'Encuesta' ? [...agendaQuestions] : undefined,
    };

    let updated: AgendaItem[];
    if (editingAgendaIndex !== null) {
      updated = [...agendaItems];
      updated[editingAgendaIndex] = newItem;
    } else {
      updated = [...agendaItems, newItem];
    }

    // Normalize sort_order
    onAgendaItemsChange(updated.map((item, i) => ({ ...item, sort_order: i + 1 })));
    resetForm();
  };

  const handleEditAgendaItem = (index: number) => {
    const item = agendaItems[index];
    setCurrentItem({
      title: item.title,
      is_votable: item.is_votable,
      required_quorum: item.required_quorum,
      type: item.type,
    });

    if ((item.is_votable || item.type === 'Encuesta') && item.votingQuestions?.length) {
      setAgendaQuestions(item.votingQuestions);
      setShowVotingForm(true);
    } else if (item.type === 'Encuesta') {
      setAgendaQuestions([]);
      setShowVotingForm(true);
    } else {
      setAgendaQuestions([]);
      setShowVotingForm(false);
    }

    setEditingQuestionIndex(null);
    setEditingAgendaIndex(index);
  };

  // Voting question handlers
  const addVotingQuestion = () => {
    if (!currentQuestion.question_text?.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    const validOptions = currentQuestion.options?.filter((o) => o.text.trim()) || [];
    if (validOptions.length < 2) {
      alert('Debes agregar al menos 2 opciones');
      return;
    }

    const newQuestion: VotingQuestion = {
      question_text: currentQuestion.question_text!,
      description: currentQuestion.description || '',
      type: currentQuestion.type || 'simple',
      result_type: currentQuestion.result_type || 'relative_majority',
      min_selections: Number(currentQuestion.min_selections) || 1,
      max_selections: Number(currentQuestion.max_selections) || 1,
      options: validOptions,
    };

    if (editingQuestionIndex !== null) {
      const updated = [...agendaQuestions];
      updated[editingQuestionIndex] = { ...newQuestion, id: agendaQuestions[editingQuestionIndex]?.id };
      setAgendaQuestions(updated);
      setEditingQuestionIndex(null);
    } else {
      setAgendaQuestions([...agendaQuestions, newQuestion]);
    }

    setCurrentQuestion({ ...EMPTY_CURRENT_QUESTION });
  };

  const removeVotingQuestion = (index: number) => {
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setCurrentQuestion({ ...EMPTY_CURRENT_QUESTION });
    }
    setAgendaQuestions(agendaQuestions.filter((_, i) => i !== index));
  };

  const handleEditVotingQuestion = (index: number) => {
    const question = agendaQuestions[index];
    setCurrentQuestion({
      question_text: question.question_text,
      description: question.description,
      type: question.type,
      result_type: question.result_type,
      min_selections: question.min_selections,
      max_selections: question.max_selections,
      options: question.options.map((o) => ({ ...o })),
    });
    setEditingQuestionIndex(index);
    setShowVotingForm(true);
  };

  // Drag-and-drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...agendaItems];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Normalize sort_order and notify parent
    onAgendaItemsChange(reordered.map((item, i) => ({ ...item, sort_order: i + 1 })));

    // Update editingAgendaIndex if needed
    if (editingAgendaIndex !== null) {
      if (editingAgendaIndex === dragIndex) {
        setEditingAgendaIndex(dropIndex);
      } else if (dragIndex < editingAgendaIndex && dropIndex >= editingAgendaIndex) {
        setEditingAgendaIndex(editingAgendaIndex - 1);
      } else if (dragIndex > editingAgendaIndex && dropIndex <= editingAgendaIndex) {
        setEditingAgendaIndex(editingAgendaIndex + 1);
      }
    }

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={styles.ordenDiaSection}>
      <div className={styles.sectionHeader}>
        <h2>Orden del día</h2>
      </div>

      {/* Form to add/edit agenda item */}
      <div className={styles.agendaFormCard}>
        <div className={styles.agendaFormField}>
          <label className={styles.agendaFormLabel}>Agregar punto a la agenda:</label>
          <input
            type="text"
            value={currentItem.title}
            onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
            placeholder="Título del punto"
            className={styles.agendaFormInput}
          />
        </div>

        <div className={styles.agendaFormRow}>
          <select
            value={currentItem.type}
            onChange={(e) => {
              const selectedType = e.target.value as 'Encuesta' | 'Documento' | 'Texto';
              const isSurvey = selectedType === 'Encuesta';
              setCurrentItem({
                ...currentItem,
                type: selectedType,
                is_votable: isSurvey ? true : false,
              });
              if (!isSurvey) {
                setAgendaQuestions([]);
                setEditingQuestionIndex(null);
              }
              setShowVotingForm(isSurvey);
            }}
            className={styles.agendaTypeSelect}
          >
            <option value="Texto">Texto</option>
            <option value="Encuesta">Encuesta</option>
            <option value="Documento">Documento</option>
          </select>

          <label className={styles.agendaCheckboxLabel}>
            <input
              type="checkbox"
              checked={currentItem.is_votable}
              disabled={currentItem.type === 'Encuesta'}
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
              className={styles.agendaQuorumInput}
            />
          )}
        </div>

        {/* Voting questions sub-form */}
        {showVotingForm && (
          <VotingQuestionsForm
            agendaQuestions={agendaQuestions}
            currentQuestion={currentQuestion}
            editingQuestionIndex={editingQuestionIndex}
            onCurrentQuestionChange={setCurrentQuestion}
            onAddQuestion={addVotingQuestion}
            onRemoveQuestion={removeVotingQuestion}
            onEditQuestion={handleEditVotingQuestion}
            onCancelEditQuestion={() => {
              setEditingQuestionIndex(null);
              setCurrentQuestion({ ...EMPTY_CURRENT_QUESTION });
            }}
          />
        )}

        <div className={styles.agendaFormActions}>
          <button type="button" onClick={addAgendaItem} className={styles.btnPrimary}>
            {editingAgendaIndex !== null ? 'Actualizar punto' : '+ Agregar punto'}
          </button>
          {editingAgendaIndex !== null && (
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* List of agenda items */}
      {agendaItems.length > 0 ? (
        <div className={styles.agendaItemsList}>
          <h4 className={styles.agendaItemsTitle}>
            Puntos en la agenda ({agendaItems.length}):
          </h4>

          {agendaItems.map((item, index) => (
            <div
              key={item.id || index}
              className={`${styles.agendaItemCard} ${dragIndex === index ? styles.agendaItemDragging : ''} ${dragOverIndex === index ? styles.agendaItemDragOver : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.agendaDragHandle} title="Arrastra para reordenar">
                ⠿
              </div>
              <div className={styles.agendaItemContent}>
                <div className={styles.agendaItemName}>
                  {index + 1}. {item.title}
                  {showSavedBadge && item.id && (
                    <span className={styles.savedBadge}>Guardado</span>
                  )}
                </div>
                <div className={styles.agendaItemMeta}>
                  <span className={`${styles.agendaTypeBadge} ${item.is_votable ? styles.badgeActive : styles.badgeInactive}`}>
                    {item.type}
                  </span>
                  {item.is_votable && <span>Quorum: {item.required_quorum}%</span>}
                  {item.votingQuestions && item.votingQuestions.length > 0 && (
                    <span className={styles.questionCountBadge}>
                      {item.votingQuestions.length} pregunta(s)
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.agendaItemActions}>
                <button
                  type="button"
                  onClick={() => handleEditAgendaItem(index)}
                  className={`${styles.btnSmall} ${styles.btnEdit}`}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveAgendaItem(index)}
                  className={`${styles.btnSmall} ${styles.btnDanger}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.agendaEmpty}>
          No hay puntos en la agenda. Agrega uno usando el formulario de arriba.
        </div>
      )}
    </div>
  );
}
