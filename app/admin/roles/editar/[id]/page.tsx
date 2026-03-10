'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { Roles } from '@/app/types/roles'
import { getById, update } from '@/app/services/roles.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

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
          <div className={styles.loading}>
            <p>Cargando datos del rol...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />
        
        <div className={styles.formSectionTitle}>
          Editar rol
        </div>

        {message && (
          <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Nombre del rol: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Administrador, Editor, Visualizador"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Descripción:</span>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe las funciones de este rol"
                className={styles.formTextarea}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Permisos (scopes):</span>
              <textarea 
                name="scopes" 
                value={formData.scopes}
                onChange={handleChange}
                rows={4}
                placeholder="Ej: users.read, users.write, roles.admin, assemblies.create"
                className={styles.formTextarea}
              />
              <span className={styles.formHint}>Ingrese los permisos separados por comas</span>
            </label>
          </div>

          <div className={styles.formButtons}>
            <Link href="/admin/roles">
              <button type="button" className={styles.btnCancel}>
                Cancelar
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className={styles.btnSubmit}
            >
              {saving ? 'Guardando...' : 'Actualizar rol'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
