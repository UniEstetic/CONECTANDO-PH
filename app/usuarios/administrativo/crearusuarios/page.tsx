'use client'

import { useState, FormEvent } from 'react'
import { User } from '@/app/lib/definitions/users'
import { create } from '@/app/lib/services/users.service'

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
      // Por ahora solo mostramos el nombre
      console.log('Archivo seleccionado:', file.name)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await create(formData)
      
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
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '20px',
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Panel izquierdo - Crear usuario */}
      <div>
        <div style={{
          backgroundColor: '#c4a861',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          Crear usuario
        </div>

        {message && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Nombre:</span>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Apellido:</span>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Email:</span>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Contraseña:</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Tipo de documento:</span>
              <input 
                type="text" 
                name="document_type" 
                value={formData.document_type}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Número de documento:</span>
              <input 
                type="text" 
                name="document_number" 
                value={formData.document_number}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Número celular:</span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Tipo de usuario:</span>
              <select 
                name="type_person" 
                value={formData.type_person}
                onChange={handleChange}
                required
                style={{ 
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '15px',
                  fontSize: '14px',
                  backgroundColor: 'white'
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

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ minWidth: '160px', textAlign: 'left' }}>Imagen de perfil:</span>
              <div style={{ flex: 1 }}>
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
                    padding: '6px 20px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Subir archivo
                </label>
              </div>
            </label>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '10px 40px',
                backgroundColor: loading ? '#ccc' : 'white',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Enviando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </div>

      {/* Panel derecho - Ver usuarios */}
      <div>
        <div style={{
          backgroundColor: '#c4a861',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          Ver usuarios
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <span>Filtrar por:</span>
            <button
              onClick={() => setActiveFilter('Nombres')}
              style={{
                padding: '6px 15px',
                backgroundColor: activeFilter === 'Nombres' ? '#e8e8e8' : 'white',
                border: '1px solid #ccc',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Nombres
            </button>
            <button
              onClick={() => setActiveFilter('Documento')}
              style={{
                padding: '6px 15px',
                backgroundColor: activeFilter === 'Documento' ? '#e8e8e8' : 'white',
                border: '1px solid #ccc',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Documento
            </button>
            <button
              onClick={() => setActiveFilter('Tipo de usuario')}
              style={{
                padding: '6px 15px',
                backgroundColor: activeFilter === 'Tipo de usuario' ? '#e8e8e8' : 'white',
                border: '1px solid #ccc',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Tipo de usuario
            </button>
            <button
              onClick={() => setActiveFilter('Correo')}
              style={{
                padding: '6px 15px',
                backgroundColor: activeFilter === 'Correo' ? '#e8e8e8' : 'white',
                border: '1px solid #ccc',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Correo
            </button>
          </div>
        </div>

        <div style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '40px 20px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          fontSize: '14px',
          color: '#666'
        }}>
          En este espacio se listan todos los usuarios
        </div>
      </div>
    </div>
  )
}