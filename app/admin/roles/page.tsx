'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import ToastNotice from '@/app/components/general/ToastNotice'
import { useState, useEffect } from 'react'
import { getAll, remove } from '@/app/services/roles.service'
import { Roles } from '@/app/types/roles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LoadingState from '@/app/components/LoadingState'
import ConfirmDeleteModal from '@/app/components/ConfirmDeleteModal';

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Roles[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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

  const [deleting, setDeleting] = useState(false)
  const handleDelete = async (id: string) => {
    try {
      setDeleting(true)
      await remove(id)
      setDeleteModal({ show: false, id: null, name: '' })
      setMessage({ type: 'success', text: 'Rol eliminado correctamente' })
      loadRoles()
    } catch (error) {
      console.error('Error al eliminar rol:', error)
      setMessage({ type: 'error', text: 'Error al eliminar el rol' })
    } finally {
      setDeleting(false)
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

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

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
            <LoadingState message="Cargando roles..." />
          ) : filteredRoles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
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
                      <Link href={`/admin/roles/editar/${role.id}`} className={styles.btnIcon} title="Editar">✏️</Link>
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

      <ConfirmDeleteModal
        isOpen={deleteModal.show}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar el rol?"
        itemName={deleteModal.name}
        isProcessing={deleting}
        onCancel={() => setDeleteModal({ show: false, id: null, name: '' })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
      />
    </div>
  )
}
