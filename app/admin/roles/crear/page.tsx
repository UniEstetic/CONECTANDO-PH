'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent } from 'react'
import { Roles } from '@/app/types/roles'
import { create } from '@/app/services/roles.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
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
        
        <div style={{
          backgroundColor: '#c4a861',
          color: 'white',
          padding: '12px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontWeight: '500',
          fontSize: '15px'
        }}>
          Crear nuevo rol
        </div>

        {message && (
          <div style={{
            padding: '10px 12px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nombre del Rol */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Nombre del rol: <span style={{ color: 'red' }}>*</span></span>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Administrador, Editor, Visualizador"
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </label>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Descripción:</span>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe las funciones de este rol"
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </label>
          </div>

          {/* Permisos/Scopes */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Permisos (scopes):</span>
              <textarea 
                name="scopes" 
                value={formData.scopes}
                onChange={handleChange}
                rows={4}
                placeholder="Ej: users.read, users.write, roles.admin, assemblies.create"
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Ingrese los permisos separados por comas
              </span>
            </label>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <Link href="/admin/roles">
              <button 
                type="button"
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '12px 50px',
                backgroundColor: loading ? '#ccc' : '#c4a861',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Guardando...' : 'Guardar rol'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
