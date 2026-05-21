'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { useState, useEffect } from 'react'
import { getAll, remove } from '@/app/services/users.service'
import { User } from '@/app/types/users'
import Link from 'next/link'
import { useProperty } from '@/app/context/PropertyContext'
import LoadingState from '@/app/components/LoadingState'
import ConfirmDeleteModal from '@/app/components/ConfirmDeleteModal';

const USUARIOS_LIST_FIELDS = [
  'id',
  'first_name',
  'last_name',
  'email',
  'document_number',
  'type_person',
  'is_active',
];

export default function ListadoUsuariosPage() {
  const { selectedPropertyId: phId } = useProperty();

  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null; name: string }>({
    show: false,
    id: null,
    name: ''
  })

  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (phId) loadUsuarios()
  }, [phId])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const response = await getAll({
        phs_id: phId,
        fields: USUARIOS_LIST_FIELDS.join(','),
      })
      setUsuarios(response.data)
      console.log("Los usuarios", response.data)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true)
      await remove(id)
      setDeleteModal({ show: false, id: null, name: '' })
      loadUsuarios()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      alert('Error al eliminar el usuario')
    }
     finally {
      setDeleting(false)
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
            <LoadingState message="Cargando usuarios..." />
          ) : filteredUsuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
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

      <ConfirmDeleteModal
              isOpen={deleteModal.show}
              title="Confirmar eliminación"
              message="¿Está seguro de que desea eliminar al usuario"
              itemName={deleteModal.name}
              isProcessing={deleting}
              onCancel={() => setDeleteModal({ show: false, id: null, name: '' })}
              onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
            />
    </div>
  )
}
