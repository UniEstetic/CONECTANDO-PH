'use client';

import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css'; 
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Assembly } from '@/app/types/assemblies';
import { getAll, remove } from '@/app/services/assemblies.service';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { useRouter } from 'next/navigation';

export default function MenuAsambleas() {
  const router = useRouter();
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAssemblies();
  }, []);

  const loadAssemblies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAll({ limit: '100', page: '1' });
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string }> = {
      'scheduled': { bg: '#3498db', text: 'white' },
      'in_progress': { bg: '#27ae60', text: 'white' },
      'completed': { bg: '#95a5a6', text: 'white' },
      'cancelled': { bg: '#e74c3c', text: 'white' }
    };
    
    const color = statusColors[status] || { bg: '#95a5a6', text: 'white' };
    
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: color.bg,
        color: color.text
      }}>
        {status === 'scheduled' ? 'Programada' : 
         status === 'in_progress' ? 'En progreso' : 
         status === 'completed' ? 'Completada' : 
         status === 'cancelled' ? 'Cancelada' : status}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.divAssambleasConf}>
          <div>
            <Link href="/admin/asambleas/crear" className={styles.btnUsuarios}>
              <button className={styles.configButton}>
                Configurar nueva asamblea
              </button>
            </Link>
          </div>

          <div className={styles.assambleasSidebar}>
            <div className={styles.assambleasList}>
              <h3 className={styles.assambleasTitle}>Asambleas programadas</h3>
              
              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: 'white',
                  fontWeight: 500 
                }}>
                  Cargando asambleas...
                </div>
              ) : error ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#e74c3c',
                  fontWeight: 500 
                }}>
                  {error}
                </div>
              ) : assemblies.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: 'white',
                  fontWeight: 500 
                }}>
                  No hay asambleas programadas
                </div>
              ) : (
                assemblies.map((asembly) => (
                  <div key={asembly.id} className={styles.assambleasItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '14px',
                        color: '#6b5b3e',
                        marginBottom: '4px'
                      }}>
                        {asembly.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b5b3e',
                        marginBottom: '4px'
                      }}>
                        {formatDate(asembly.scheduled_at)}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {getStatusBadge(asembly.status)}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '6px' 
                    }}>
                      <Link href={`/admin/asambleas/editar/${asembly.id}`}>
                        <button 
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(asembly.id!)}
                        disabled={deletingId === asembly.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: deletingId === asembly.id ? '#95a5a6' : '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: deletingId === asembly.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {deletingId === asembly.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                ))
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
