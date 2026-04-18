'use client';

import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import StatusToggle from '@/app/components/general/StatusToggle';
import { AssemblyFormData } from '@/app/types/assemblies';

type Props = {
  formData: AssemblyFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onToggleActive: (checked: boolean) => void;
  title?: string;
  showStatus?: boolean;
};

export default function AssemblyInfoForm({ formData, onChange, onToggleActive, title = 'Información General de Asamblea', showStatus = false }: Props) {
  return (
    <div className={styles.infoGeneralSection}>
      <div className={styles.sectionHeader}>
        <h2>{title}</h2>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name">Título de asamblea:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          className={styles.formInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Descripción:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          className={styles.formTextarea}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="type">Tipo de asamblea:</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value="Ordinaria">Ordinaria</option>
          <option value="Extraordinaria">Extraordinaria</option>
        </select>
      </div>

      {showStatus && (
        <div className={styles.formGroup}>
          <label htmlFor="status">Estado:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={onChange}
            className={styles.formSelect}
          >
            <option value="scheduled">Programada</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="scheduled_at">Fecha y hora:</label>
        <div className={styles.inputWithIcon}>
          <input
            type="datetime-local"
            id="scheduled_at"
            name="scheduled_at"
            value={formData.scheduled_at}
            onChange={onChange}
            className={styles.formInputDatetime}
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
          onChange={onChange}
          min="0"
          max="100"
          className={styles.formInput}
        />
      </div>

      <StatusToggle
        entityLabel="Asamblea"
        checked={formData.is_active ?? true}
        onChange={onToggleActive}
        activeText="activa"
        inactiveText="no activa"
      />
    </div>
  );
}
