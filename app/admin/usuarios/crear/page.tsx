'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent } from 'react'
import { User } from '@/app/types/users'
import { create } from '@/app/services/users.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';

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
  const [activeFilter, setActiveFilter] = useState('Nombres')

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
      {/* Panel izquierdo - Crear usuario */}
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
          Crear usuario
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
          {/* Nombre */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Nombre:</span>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                onChange={handleChange}
                required
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

          {/* Apellido */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Apellido:</span>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                onChange={handleChange}
                required
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

          {/* Email */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Email:</span>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
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

          {/* Contraseña */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Contraseña (opcional):</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Tipo de documento */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Tipo de documento:</span>
              <input 
                type="text" 
                name="document_type" 
                value={formData.document_type}
                onChange={handleChange}
                required
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

          {/* Número de documento */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Número de documento:</span>
              <input 
                type="text" 
                name="document_number" 
                value={formData.document_number}
                onChange={handleChange}
                required
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

          {/* Número celular */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Número celular:</span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
                required
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

          {/* Tipo de usuario */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Tipo de usuario:</span>
              <select 
                name="type_person" 
                value={formData.type_person}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Seleccione</option>
                <option value="Natural">Natural</option>
                <option value="Juridica">Jurídica</option>
                <option value="Administrador">Administrador</option>
                <option value="Empleado">Empleado</option>
              </select>
            </label>
          </div>

          {/* Imagen de perfil */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '500' }}>Imagen de perfil:</span>
              <div>
                <input 
                  type="file"
                  id="avatar-upload"
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor="avatar-upload"
                  style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  Subir archivo
                </label>
              </div>
            </label>
          </div>

          {/* Botón de envío */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '12px 50px',
                backgroundColor: loading ? '#ccc' : 'white',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '25px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              {loading ? 'Enviando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}