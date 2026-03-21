'use client';

import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import { VotingQuestion } from '../_types';

type Props = {
  agendaQuestions: VotingQuestion[];
  currentQuestion: Partial<VotingQuestion>;
  editingQuestionIndex: number | null;
  onCurrentQuestionChange: (q: Partial<VotingQuestion>) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onEditQuestion?: (index: number) => void;
  onCancelEditQuestion?: () => void;
};

export default function VotingQuestionsForm({
  agendaQuestions,
  currentQuestion,
  editingQuestionIndex,
  onCurrentQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onEditQuestion,
  onCancelEditQuestion,
}: Props) {
  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = { ...newOptions[index], text };
    onCurrentQuestionChange({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    onCurrentQuestionChange({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), { text: '' }],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = (currentQuestion.options || []).filter((_, i) => i !== index);
    onCurrentQuestionChange({ ...currentQuestion, options: newOptions });
  };

  return (
    <div className={styles.votingFormContainer}>
      <div className={styles.votingFormTitle}>Preguntas de Votación</div>

      {/* Lista de preguntas ya agregadas */}
      {agendaQuestions.length > 0 && (
        <div className={styles.votingQuestionsList}>
          {agendaQuestions.map((q, idx) => (
            <div key={idx} className={styles.votingQuestionItem}>
              <div>
                <div className={styles.votingQuestionText}>{q.question_text}</div>
                <div className={styles.votingQuestionMeta}>{q.options.length} opciones</div>
              </div>
              <div className={styles.votingQuestionActions}>
                {onEditQuestion && (
                  <button
                    type="button"
                    onClick={() => onEditQuestion(idx)}
                    className={`${styles.btnSmall} ${styles.btnEdit}`}
                  >
                    Editar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(idx)}
                  className={`${styles.btnSmall} ${styles.btnDanger}`}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para nueva/editar pregunta */}
      <div className={styles.votingQuestionForm}>
        <input
          type="text"
          value={currentQuestion.question_text}
          onChange={(e) => onCurrentQuestionChange({ ...currentQuestion, question_text: e.target.value })}
          placeholder="Texto de la pregunta"
          className={styles.votingInput}
        />
        <textarea
          value={currentQuestion.description}
          onChange={(e) => onCurrentQuestionChange({ ...currentQuestion, description: e.target.value })}
          placeholder="Descripción (opcional)"
          className={styles.votingTextarea}
        />
        <div className={styles.votingSelectsRow}>
          <select
            value={currentQuestion.type}
            onChange={(e) => onCurrentQuestionChange({ ...currentQuestion, type: e.target.value })}
            className={styles.votingSelect}
          >
            <option value="simple">Simple</option>
            <option value="multiple">Múltiple</option>
          </select>
          <select
            value={currentQuestion.result_type}
            onChange={(e) => onCurrentQuestionChange({ ...currentQuestion, result_type: e.target.value })}
            className={styles.votingSelect}
          >
            <option value="relative_majority">Mayoría relativa</option>
            <option value="absolute_majority">Mayoría absoluta</option>
            <option value="two_thirds">2/3 partes</option>
          </select>
        </div>

        <div className={styles.votingOptionsLabel}>Opciones de respuesta:</div>
        {currentQuestion.options?.map((opt, idx) => (
          <div key={idx} className={styles.votingOptionRow}>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => updateOptionText(idx, e.target.value)}
              placeholder={`Opción ${idx + 1}`}
              className={styles.votingOptionInput}
            />
            {(currentQuestion.options?.length || 0) > 2 && (
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className={`${styles.btnSmall} ${styles.btnDanger}`}
              >
                X
              </button>
            )}
          </div>
        ))}

        <div className={styles.votingFormActions}>
          <button type="button" onClick={addOption} className={`${styles.btnSmall} ${styles.btnSuccess}`}>
            + Agregar opción
          </button>
          <button type="button" onClick={onAddQuestion} className={`${styles.btnSmall} ${styles.btnPrimary}`}>
            {editingQuestionIndex !== null ? 'Actualizar pregunta' : '+ Agregar pregunta'}
          </button>
          {editingQuestionIndex !== null && onCancelEditQuestion && (
            <button type="button" onClick={onCancelEditQuestion} className={`${styles.btnSmall} ${styles.btnSecondary}`}>
              Cancelar edición
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
