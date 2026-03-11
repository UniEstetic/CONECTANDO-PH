'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import pageStyles from '@/app/ui/styles/EntityForm.module.css';
import { useState, FormEvent } from 'react'
import { Roles } from '@/app/types/roles'
import { create } from '@/app/services/roles.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import ToastNotice from '@/app/components/general/ToastNotice'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type RoleFormData = Omit<Roles, 'id' | 'created_at'>

export default function CrearRolPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    scopes: '',
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const payload = {
        name: formData.name.trim(),
        ...(formData.description?.trim() ? { description: formData.description.trim() } : {}),
        ...(formData.scopes?.trim() ? { scopes: formData.scopes.trim() } : {}),
      }

      await create(payload)
      
      setMessage({ type: 'success', text: 'Rol creado exitosamente' })
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        scopes: '',
        is_active: true
      })

      // Redireccionar después de 1.5 segundos
      setTimeout(() => {
        router.push('/admin/roles')
      }, 1500)

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al crear el rol' 
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
          <Link href="/admin/roles" className={styles.btnBack}></Link>
        </div>
        
        <div className={pageStyles.titleBanner}>
          Crear nuevo rol
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <div className={pageStyles.formGrid}>
            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Nombre del rol: *</span>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Administrador, Editor, Visualizador"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Descripción:</span>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe las funciones de este rol"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Permisos (scopes):</span>
              <textarea 
                name="scopes" 
                value={formData.scopes}
                onChange={handleChange}
                rows={4}
                placeholder="Ej: users.read, users.write, roles.admin, assemblies.create"
                className={pageStyles.input}
              />
              <span className={styles.formHint} style={{ color: '#ffffff' }}>
                Ingrese los permisos separados por comas
              </span>
            </label>
          </div>

          <div className={pageStyles.actions}>
            <Link href="/admin/roles" className={pageStyles.cancelButton}>Cancelar</Link>
            <button 
              type="submit" 
              disabled={loading}
              className={pageStyles.submitButton}
            >
              {loading ? 'Guardando...' : 'Guardar rol'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
