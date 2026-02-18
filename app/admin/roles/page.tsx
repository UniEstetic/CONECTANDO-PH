'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { useState, useEffect } from 'react'
import { getAll, remove } from '@/app/services/roles.service'
import { Roles } from '@/app/types/roles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Roles[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null; name: string }>({
    show: false,
    id: null,
    name: ''
  })

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await getAll()
      setRoles(response.data)
    } catch (error) {
      console.error('Error al cargar roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      setDeleteModal({ show: false, id: null, name: '' })
      loadRoles()
    } catch (error) {
      console.error('Error al eliminar rol:', error)
      alert('Error al eliminar el rol')
    }
  }

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ show: true, id, name })
  }

  // Filtrar roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'activos' && role.is_active) ||
                         (statusFilter === 'inactivos' && !role.is_active)
    return matchesSearch && matchesStatus
  })

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href="/admin" className={styles.btnBack}></Link>
          <Link href="/admin/roles/crear" className={styles.btnNew}>
            Nuevo Rol
          </Link>
        </div>

        {/* Buscador y Filtros */}
        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </section>

        {/* Tabla de Roles */}
        <section className={styles.tableContainer}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No se encontraron roles</p>
            </div>
          ) : (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Permisos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td className={styles.userCell}>
                      <div className={styles.avatar}>
                        {role.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{role.name}</span>
                      </div>
                    </td>
                    <td>{role.description}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 10px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '12px',
                        fontSize: '12px',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {role.scopes || 'Sin permisos'}
                      </span>
                    </td>
                    <td>
                      <span className={role.is_active ? styles.statusActive : styles.statusInactive}>
                        {role.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <Link href={`/admin/roles/editar/${role.id}`}>
                        <button className={styles.btnIcon} title="Editar">✏️</button>
                      </Link>
                      <button 
                        className={styles.btnIcon} 
                        title="Eliminar"
                        onClick={() => openDeleteModal(role.id!, role.name)}
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* Modal de Confirmación de Eliminación */}
      {deleteModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Confirmar eliminación</h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              ¿Está seguro de que desea eliminar el rol <strong>{deleteModal.name}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteModal.id && handleDelete(deleteModal.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
