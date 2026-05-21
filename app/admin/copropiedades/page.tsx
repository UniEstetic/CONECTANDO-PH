'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { useState, useEffect } from 'react'
import { getAll, remove } from '@/app/services/phs.service'
import { Phs } from '@/app/types/phs'
import ToastNotice from '@/app/components/general/ToastNotice'
import LoadingState from '@/app/components/LoadingState'
import { useSession } from 'next-auth/react'
import ConfirmDeleteModal from '@/app/components/ConfirmDeleteModal';

const COPROPIEDADES_LIST_FIELDS = [
  'id',
  'name',
  'address',
  'city',
  'is_active',
  'number_of_towers',
  'amount_of_real_estate',
];

export default function CopropiedadesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [copropiedades, setCopropiedades] = useState<Phs[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null; name: string }>({
    show: false,
    id: null,
    name: ''
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (userId) loadCopropiedades()
  }, [userId])

  const loadCopropiedades = async () => {
    try {
      setLoading(true)
      const response = await getAll({
        user_id: userId,
        fields: COPROPIEDADES_LIST_FIELDS.join(','),
      })
      console.log("Las copropiedades", response)
      setCopropiedades(response.data)
    } catch (error) {
      console.error('Error al cargar copropiedades:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al cargar copropiedades',
      })
      setCopropiedades([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true)
      await remove(id)
      setDeleteModal({ show: false, id: null, name: '' })
      loadCopropiedades()
    } catch (error) {
      console.error('Error al eliminar copropiedad:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al eliminar la copropiedad',
      })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ show: true, id, name })
  }

  const getPhId = (ph: Phs) => {
    const rawId = (ph as any)?.id ?? (ph as any)?._id ?? (ph as any)?.ph_id
    return rawId ? String(rawId) : ''
  }

  // Filtrar copropiedades
  const filteredCopropiedades = copropiedades.filter(ph => {
    const matchesSearch = ph.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ph.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ph.city?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href="/admin" className={styles.btnBack}></Link>
          <Link href="/admin/copropiedades/crear" className={styles.btnNew}>
            Nueva Copropiedad
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', margin: '0 0 8px 0', fontWeight: '600' }}>Mis Copropiedades</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>Selecciona una copropiedad para gestionar</p>
        </div>

        {/* Buscador */}
        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, dirección o ciudad..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </section>

        {loading ? (
          <LoadingState message="Cargando copropiedades..." />
        ) : filteredCopropiedades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
            <p>No se encontraron copropiedades</p>
          </div>
        ) : (
          <section className={styles.gridCopropiedades}>
            {filteredCopropiedades.map((ph) => {
              const phId = getPhId(ph)

              return (
              <div key={phId || `${ph.name}-${ph.address}`} className={styles.phCard}>
                <div className={styles.imageWrapper}>
                  {/* Imagen de la copropiedad o placeholder */}
                  <div className={styles.placeholderImg}>
                    <Image 
                      src="/imagenes/15_boton mis copropiedades.svg" 
                      alt="PH" 
                      width={50} 
                      height={50} 
                      className={styles.iconOverlay}
                    />
                  </div>
                  <span className={styles.roleTag}>{ph.is_active ? 'Activo' : 'Inactivo'}</span>
                </div>

                <div className={styles.phContent}>
                  <h3 className={styles.phName}>{ph.name}</h3>
                  <p className={styles.phAddress}>{ph.address} - {ph.city}</p>
                  
                  <div className={styles.phStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{ph.number_of_towers || 'N/A'}</span>
                      <span className={styles.statLabel}>Torres</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{ph.amount_of_real_estate || 'N/A'}</span>
                      <span className={styles.statLabel}>Unidades</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className={styles.cardActions}>
                    <Link href={phId ? `/admin/copropiedades/editar/${phId}` : '/admin/copropiedades'} className={styles.btnEdit}>
                      ✏️ Editar
                    </Link>
                    <button 
                      className={styles.btnDelete}
                      disabled={!phId}
                      onClick={() => phId && openDeleteModal(phId, ph.name)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>

                  <Link href={phId ? `/admin/copropiedades/unidades/${phId}` : '/admin/copropiedades'} className={styles.btnEnter}>
                    Gestionar Copropiedad
                  </Link>
                </div>
              </div>
            )})}

            {/* Botón para agregar nueva copropiedad */}
            <Link href="/admin/copropiedades/crear" className={styles.btnAddPH}>
              <span className={styles.plusIcon}>+</span>
              <span>Vincular Nueva Copropiedad</span>
            </Link>
          </section>
        )}
      </main>

      <ConfirmDeleteModal
        isOpen={deleteModal.show}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar la copropiedad"
        itemName={deleteModal.name}
        isProcessing={deleting}
        onCancel={() => setDeleteModal({ show: false, id: null, name: '' })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
      />
    </div>
  )
}
