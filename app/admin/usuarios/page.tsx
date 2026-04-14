'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { useState, useEffect } from 'react'
import { getAll, remove } from '@/app/services/users.service'
import { User } from '@/app/types/users'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function ListadoUsuariosPage() {
  const { data: session } = useSession();
  const phId = session?.user?.ownership?.id;

  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null; name: string }>({
    show: false,
    id: null,
    name: ''
  })

  useEffect(() => {
    if (phId) loadUsuarios()
  }, [phId])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const response = await getAll({ phs_id: phId })
      setUsuarios(response.data)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      setDeleteModal({ show: false, id: null, name: '' })
      loadUsuarios()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      alert('Error al eliminar el usuario')
    }
  }

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ show: true, id, name })
  }

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.document_number.includes(searchTerm)
    const matchesRole = roleFilter === 'todos' || 
                        user.type_person.toLowerCase() === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href="/admin" className={styles.btnBack}></Link>
          <Link href="/admin/usuarios/crear" className={styles.btnNew}>
            Nuevo Usuario
          </Link>
        </div>

        {/* Buscador y Filtros */}
        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o documento..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
          </select>
        </section>

        {/* Tabla de Usuarios */}
        <section className={styles.tableContainer}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando usuarios...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((user) => (
                  <tr key={user.id}>
                    <td className={styles.userCell}>
                      <div className={styles.avatar}>
                        {user.first_name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.first_name} {user.last_name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </td>
                    <td>{user.document_number || 'N/A'}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[user.type_person?.toLowerCase() || 'natural']}`}>
                        {user.type_person || 'Usuario'}
                      </span>
                    </td>
                    <td>
                      <span className={user.is_active ? styles.statusActive : styles.statusInactive}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <Link href={`/admin/usuarios/editar/${user.id}`}>
                        <button className={styles.btnIcon} title="Editar">✏️</button>
                      </Link>
                      <button 
                        className={styles.btnIcon} 
                        title="Eliminar"
                        onClick={() => openDeleteModal(user.id!, `${user.first_name} ${user.last_name}`)}
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
              ¿Está seguro de que desea eliminar al usuario <strong>{deleteModal.name}</strong>? 
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
