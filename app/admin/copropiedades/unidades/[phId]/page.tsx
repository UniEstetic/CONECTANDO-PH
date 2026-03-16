'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react'
import { getAll, remove } from '@/app/services/units.service'
import { Units } from '@/app/types/units'
import UsuariosHeader from '@/app/components/UsuariosHeader';

export default function UnidadesPage() {
  const params = useParams()
  const phId = Array.isArray(params.phId) ? params.phId[0] : params.phId
  
  const [unidades, setUnidades] = useState<Units[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [blockFilter, setBlockFilter] = useState('todos')
  const [blocks, setBlocks] = useState<string[]>([])
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null; unit: string }>({
    show: false,
    id: null,
    unit: ''
  })

  useEffect(() => {
    if (phId && phId !== 'undefined' && phId !== 'null') {
      loadUnidades(phId)
    } else {
      setUnidades([])
      setBlocks([])
      setLoading(false)
    }
  }, [phId])

  const loadUnidades = async (currentPhId: string) => {
    try {
      setLoading(true)
      const response = await getAll(currentPhId)
      const rawData = (response as any)?.data

      const normalizedUnidades: Units[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.items)
            ? rawData.items
            : []

      setUnidades(normalizedUnidades)
      
      // Extraer bloques únicos para el filtro
      const uniqueBlocks = [...new Set(normalizedUnidades.map((u) => u.block).filter(Boolean))]
      setBlocks(uniqueBlocks as string[])
    } catch (error) {
      console.error('Error al cargar unidades:', error)
      setUnidades([])
      setBlocks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      if (!phId || phId === 'undefined' || phId === 'null') {
        throw new Error('Copropiedad inválida')
      }

      await remove(phId, id)
      setDeleteModal({ show: false, id: null, unit: '' })
      loadUnidades(phId)
    } catch (error) {
      console.error('Error al eliminar unidad:', error)
      alert('Error al eliminar la unidad')
    }
  }

  const openDeleteModal = (id: string, unit: string) => {
    setDeleteModal({ show: true, id, unit })
  }

  // Filtrar unidades
  const filteredUnidades = unidades.filter(unit => {
    const matchesSearch = unit.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.block?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBlock = blockFilter === 'todos' || unit.block === blockFilter
    return matchesSearch && matchesBlock
  })

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href="/admin/copropiedades" className={styles.btnBack}></Link>
          <Link href={`/admin/copropiedades/unidades/${phId}/crear`} className={styles.btnNew}>
            Nueva Unidad
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', margin: '0 0 8px 0', fontWeight: '600' }}>Gestión de Unidades</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>Administra las unidades de la copropiedad</p>
        </div>

        {/* Buscador y Filtros */}
        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Buscar por número de unidad o bloque..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className={styles.filterSelect}
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
          >
            <option value="todos">Todos los bloques</option>
            {blocks.map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </section>

        {/* Tabla de Unidades */}
        <section className={styles.tableContainer}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando unidades...</p>
            </div>
          ) : filteredUnidades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No se encontraron unidades</p>
            </div>
          ) : (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Bloque</th>
                  <th>Piso</th>
                  <th>Tipo</th>
                  <th>Área</th>
                  <th>Coeficiente</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnidades.map((unit) => (
                  <tr key={unit.id}>
                    <td className={styles.userCell}>
                      <div className={styles.avatar}>
                        {unit.unit_number?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{unit.unit_number}</span>
                      </div>
                    </td>
                    <td>{unit.block || 'N/A'}</td>
                    <td>{unit.floor || 'N/A'}</td>
                    <td>
                      <span className={styles.roleBadge}>
                        {unit.type || 'Apartamento'}
                      </span>
                    </td>
                    <td>{unit.area ? `${unit.area} m²` : 'N/A'}</td>
                    <td>{unit.coefficient || 'N/A'}</td>
                    <td>
                      <span className={unit.is_active ? styles.statusActive : styles.statusInactive}>
                        {unit.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <Link href={`/admin/copropiedades/unidades/${phId}/editar/${unit.id}`}>
                        <button className={styles.btnIcon} title="Editar">✏️</button>
                      </Link>
                      <button 
                        className={styles.btnIcon} 
                        title="Eliminar"
                        onClick={() => openDeleteModal(unit.id!, unit.unit_number || 'Unidad')}
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
              ¿Está seguro de que desea eliminar la unidad <strong>{deleteModal.unit}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModal({ show: false, id: null, unit: '' })}
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
