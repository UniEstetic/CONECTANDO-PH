'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import pageStyles from '@/app/ui/styles/EntityForm.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { Roles } from '@/app/types/roles'
import { getById, update } from '@/app/services/roles.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import StatusToggle from '@/app/components/general/StatusToggle'
import ToastNotice from '@/app/components/general/ToastNotice'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import LoadingState from '@/app/components/LoadingState'

type RoleFormData = Omit<Roles, 'id' | 'created_at'>

export default function EditarRolPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = Array.isArray(params.id) ? params.id[0] : params.id

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    scopes: '',
    is_active: true
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (roleId) {
      loadRole(roleId)
    }
  }, [roleId])

  const loadRole = async (id: string) => {
    try {
      setLoading(true)
      const response = await getById(id)
      const role = response.data
      setFormData({
        name: role.name,
        description: role.description || '',
        scopes: role.scopes || '',
        is_active: role.is_active
      })
    } catch (error) {
      console.error('Error al cargar el rol:', error)
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los datos del rol' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (!roleId) {
        throw new Error('Rol inválido')
      }

      const payload = {
        name: formData.name.trim(),
        ...(formData.description?.trim() ? { description: formData.description.trim() } : {}),
        ...(formData.scopes?.trim() ? { scopes: formData.scopes.trim() } : {}),
        is_active: formData.is_active,
      }

      await update(roleId, payload)
      
      setMessage({ type: 'success', text: 'Rol actualizado exitosamente' })
      
      setTimeout(() => {
        router.push('/admin/roles')
      }, 1500)

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar el rol' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div className={styles.headerActions}>
            <Link href="/admin/roles" className={styles.btnBack}></Link>
          </div>
          <LoadingState message="Cargando datos del rol..." variant="fullPage" />
        </main>
      </div>
    )
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href="/admin/roles" className={styles.btnBack}></Link>
        </div>
        
        <div className={pageStyles.titleBanner}>
          Editar rol
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
              <span className={styles.formHint} style={{ color: '#ffffff' }}>Ingrese los permisos separados por comas</span>
            </label>

            <StatusToggle
              entityLabel='Rol'
              checked={formData.is_active}
              onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              hint='Define si el rol está habilitado para asignación y uso.'
              activeText='activo'
              inactiveText='inactivo'
              disabled={saving}
            />
          </div>

          <div className={pageStyles.actions}>
            <Link href="/admin/roles" className={pageStyles.cancelButton}>Cancelar</Link>
            <button 
              type="submit" 
              disabled={saving}
              className={pageStyles.submitButton}
            >
              {saving ? 'Guardando...' : 'Actualizar rol'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
