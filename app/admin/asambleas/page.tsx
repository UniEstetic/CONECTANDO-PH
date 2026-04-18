'use client';

import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css'; 
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Assembly } from '@/app/types/assemblies';
import { getAll, remove } from '@/app/services/assemblies.service';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { useRouter } from 'next/navigation';
import { useProperty } from '@/app/context/PropertyContext';

const STATUS_CLASS_MAP: Record<string, string> = {
  scheduled: 'statusScheduled',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
  cancelled: 'statusCancelled',
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export default function MenuAsambleas() {
  const router = useRouter();
  const { selectedPropertyId: phsId } = useProperty();
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (phsId) {
      loadAssemblies();
    }
  }, [phsId]);

  const loadAssemblies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAll({ phs_id: phsId || '', limit: '100', page: '1' });
      setAssemblies(response.data || []);
    } catch (err) {
      console.error('Error cargando asambleas:', err);
      setError('Error al cargar las asambleas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta asamblea?')) {
      return;
    }

    try {
      setDeletingId(id);
      await remove(id);
      // Actualizar la lista después de eliminar
      setAssemblies(assemblies.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error al eliminar asamblea:', err);
      alert('Error al eliminar la asamblea');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      return new Date(dateString).toLocaleDateString('es-CO', DATE_OPTIONS);
    } catch {
      return dateString;
    }
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const cssClass = styles[STATUS_CLASS_MAP[status] || 'statusCompleted'];
    return (
      <span className={`${styles.statusBadge} ${cssClass}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.divAssambleasConf}>
          <div>
            <Link href="/admin/asambleas/crear" className={styles.configButton}>
              Configurar nueva asamblea
            </Link>
          </div>

          <div className={styles.assambleasSidebar}>
            <div className={styles.assambleasListCard}>
              <div className={styles.assambleasListHeader}>
                <h3 className={styles.assambleasTitle}>Asambleas programadas</h3>
                <span className={styles.assambleasCount}>{assemblies.length}</span>
              </div>
              
              {loading ? (
                <div className={styles.assambleasState}>
                  Cargando asambleas...
                </div>
              ) : error ? (
                <div className={`${styles.assambleasState} ${styles.assambleasStateError}`}>
                  {error}
                </div>
              ) : assemblies.length === 0 ? (
                <div className={styles.assambleasState}>
                  No hay asambleas programadas
                </div>
              ) : (
                <div className={styles.assambleasItemsScroll}>
                  {assemblies.map((asembly) => (
                    <div key={asembly.id} className={styles.assambleasItem}>
                      <div className={styles.assambleasItemMain}>
                        <div className={styles.assambleasItemName} title={asembly.name}>
                          {asembly.name}
                        </div>
                        <div className={styles.assambleasItemDate}>
                          {formatDate(asembly.scheduled_at)}
                        </div>
                        <div className={styles.assambleasItemMeta}>
                          {getStatusBadge(asembly.status)}
                        </div>
                      </div>
                      <div className={styles.assambleasActions}>
                        <Link
                          href={`/admin/asambleas/editar/${asembly.id}`}
                          className={`${styles.assambleaActionBtn} ${styles.editBtn}`}
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(asembly.id!)}
                          disabled={deletingId === asembly.id}
                          className={`${styles.assambleaActionBtn} ${styles.deleteBtn}`}
                        >
                          {deletingId === asembly.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.assambleasContainer}>
          {/* Sección derecha - Tutoriales */}
          <div className={styles.containerSelection}>
            <div className={styles.tutorialesSection}>
            <div className={styles.tutorialesHeader}>
              <h2 className={styles.titleBlock}>Tutoriales</h2>
            </div>
            
            <div className={styles.tutorialesGrid}>
              <div className={styles.tutorialCard}>
                <h4>Tutorial configuración previa de asamblea</h4>
              </div>
              
              <div className={styles.tutorialCard}>
                <h4>Tutorial gestión durante la asamblea</h4>
              </div>
              
              <div className={styles.tutorialCard}>
                <h4>Tutorial gestión durante la asamblea</h4>
              </div>
            </div>
            </div>

            <div className={styles.tutorialesSection}>
            <div className={styles.tutorialesHeader}>
              <h2 className={styles.titleBlock}>Asambleas realizadas</h2>
            </div>
            
            <div className={styles.tutorialesGrid}>
              <div className={styles.tutorialCard}>
                <p>Tutorial configuración previa de asamblea</p>
              </div>
              
              <div className={styles.tutorialCard}>
                <p>Tutorial gestión durante la asamblea</p>
              </div>
              
              <div className={styles.tutorialCard}>
                <p>Tutorial gestión durante la asamblea</p>
              </div>
            </div>
            </div>
          </div>
          
          
        </div>
      </main>
    </div>
  );
}
