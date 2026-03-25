'use client'

import { UserFormData } from '@/app/types/users'
import pageStyles from '@/app/ui/styles/EntityForm.module.css'

interface UserFormFieldsProps {
  formData: UserFormData
  password: string
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onPasswordChange: (value: string) => void
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  passwordHint?: string
  passwordPlaceholder?: string
}

export default function UserFormFields({
  formData,
  password,
  onFormChange,
  onPasswordChange,
  onFileUpload,
  passwordHint,
  passwordPlaceholder,
}: UserFormFieldsProps) {
  return (
    <div className={pageStyles.formGrid}>
      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Nombre: *</span>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        />
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Apellido: *</span>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        />
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Email: *</span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        />
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>
          {passwordHint ? 'Nueva contraseña:' : 'Contraseña (opcional):'}
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={passwordPlaceholder}
          className={pageStyles.input}
        />
        {passwordHint && (
          <span className={pageStyles.sectionHint}>{passwordHint}</span>
        )}
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Tipo de documento: *</span>
        <select
          name="document_type"
          value={formData.document_type}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        >
          <option value="">Seleccione</option>
          <option value="CC">Cédula de ciudadanía (CC)</option>
          <option value="CE">Cédula de extranjería (CE)</option>
          <option value="TI">Tarjeta de identidad (TI)</option>
          <option value="NIT">NIT</option>
          <option value="PAS">Pasaporte</option>
        </select>
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Número de documento: *</span>
        <input
          type="text"
          name="document_number"
          value={formData.document_number}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        />
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Número celular: *</span>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        />
      </label>

      <label className={pageStyles.fieldWrap}>
        <span className={pageStyles.fieldLabel}>Tipo de usuario: *</span>
        <select
          name="type_person"
          value={formData.type_person}
          onChange={onFormChange}
          required
          className={pageStyles.input}
        >
          <option value="">Seleccione</option>
          <option value="Natural">Natural</option>
          <option value="Juridica">Jurídica</option>
          <option value="Administrador">Administrador</option>
          <option value="Empleado">Empleado</option>
        </select>
      </label>

      <div className={pageStyles.uploadRow}>
        <label className={pageStyles.uploadLabel}>Imagen de perfil:</label>
        {onFileUpload && (
          <>
            <input
              type="file"
              id="avatar-upload"
              onChange={onFileUpload}
              accept="image/*"
              className={pageStyles.hiddenFileInput}
            />
            <label htmlFor="avatar-upload" className={pageStyles.uploadButton}>
              Subir archivo
            </label>
          </>
        )}
        <input
          type="text"
          name="avatar_url"
          value={formData.avatar_url}
          onChange={onFormChange}
          placeholder="URL de la imagen de perfil"
          className={pageStyles.input}
        />
      </div>
    </div>
  )
}
