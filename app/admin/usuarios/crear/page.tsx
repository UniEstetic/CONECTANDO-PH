'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent } from 'react'
import { User } from '@/app/types/users'
import { create } from '@/app/services/users.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import pageStyles from '@/app/ui/styles/EntityForm.module.css'
import Link from 'next/link'
import ToastNotice from '@/app/components/general/ToastNotice'

// Omitir campos que genera el backend
type UserFormData = Omit<User, 'id' | 'is_active' | 'created_at'>

export default function FormUser() {
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    type_person: 'Natural',
    gender: 'F',
    avatar_url: '',
    email: '',
    document_type: 'CC',
    document_number: '',
    phone_number: ''
  })

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Aquí puedes implementar la lógica para subir el archivo
      console.log('Archivo seleccionado:', file.name)
      setFormData((prev) => ({
        ...prev,
        avatar_url: file.name,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const payload: UserFormData = {
        ...formData,
        ...(password.trim() ? { password: password.trim() } : {}),
      }

      await create(payload)
      
      setMessage({ type: 'success', text: 'Usuario registrado exitosamente' })
      
      // Limpiar formulario
      setFormData({
        first_name: '',
        last_name: '',
        type_person: 'Natural',
        gender: 'F',
        avatar_url: '',
        email: '',
        document_type: 'CC',
        document_number: '',
        phone_number: ''
      })
      setPassword('')

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al enviar datos' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href='/admin/usuarios' className={styles.btnBack}></Link>
        </div>

        <div className={pageStyles.titleBanner}>
          Crear usuario
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <div className={pageStyles.formGrid}>
            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Nombre:</span>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Apellido:</span>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Email:</span>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Contrasena (opcional):</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Tipo de documento:</span>
              <select
                name="document_type" 
                value={formData.document_type}
                onChange={handleChange}
                required
                className={pageStyles.input}
              >
                <option value="">Seleccione</option>
                <option value="CC">Cedula de ciudadania (CC)</option>
                <option value="CE">Cedula de extranjeria (CE)</option>
                <option value="TI">Tarjeta de identidad (TI)</option>
                <option value="NIT">NIT</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Numero de documento:</span>
              <input 
                type="text" 
                name="document_number" 
                value={formData.document_number}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Numero celular:</span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Tipo de usuario:</span>
              <select 
                name="type_person" 
                value={formData.type_person}
                onChange={handleChange}
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
              <input 
                type="file"
                id="avatar-upload"
                onChange={handleFileUpload}
                accept="image/*"
                className={pageStyles.hiddenFileInput}
              />
              <label htmlFor="avatar-upload" className={pageStyles.uploadButton}>
                Subir archivo
              </label>
              <input
                type='text'
                name='avatar_url'
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder='URL de la imagen de perfil'
                className={pageStyles.input}
              />
            </div>
          </div>

          <div className={pageStyles.actions}>
            <Link href='/admin/usuarios' className={pageStyles.cancelButton}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className={pageStyles.submitButton}
            >
              {loading ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}