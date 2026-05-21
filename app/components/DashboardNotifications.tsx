'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAll } from '@/app/services/assemblies.service';
import { useProperty } from '@/app/context/PropertyContext';
import { Assembly } from '@/app/types/assemblies';
import styles from '@/app/ui/styles/dashboardNotifications.module.css';
import LoadingState from '@/app/components/LoadingState';

type DashboardScope = 'admin' | 'residentes' | 'porteria';

type AssemblyStatus = 'programada' | 'en_progreso' | 'cancelada' | 'completada' | 'desconocido';

interface DashboardNotificationsProps {
  scope: DashboardScope;
}

interface AssemblyNotificationItem {
  id: string;
  title: string;
  status: AssemblyStatus;
  timestamp: number; // Agregado para optimizar el ordenamiento y formateo
  livekitRoomName?: string;
  dotColor: string;
}

const MAX_VISIBLE_NOTIFICATIONS = 4;
const ASSEMBLY_DOT_COLOR = '#a434b7';
const DASHBOARD_ASSEMBLY_FIELDS = [
  'id',
  'name',
  'status',
  'scheduled_at',
  'created_at',
  'livekit_room_name',
];
const STATUS_PRIORITY: Record<AssemblyStatus, number> = {
  en_progreso: 0,
  programada: 1,
  cancelada: 2,
  completada: 3,
  desconocido: 4,
};

// Optimizado usando arreglos e .includes() para mayor legibilidad y rapidez
function normalizeStatus(status: string | undefined): AssemblyStatus {
  if (!status) return 'desconocido';
  const value = status.toLowerCase().trim();

  if (['programada', 'scheduled'].includes(value)) return 'programada';
  if (['en progreso', 'in_progress', 'in progress'].includes(value)) return 'en_progreso';
  if (['cancelada', 'cancelled'].includes(value)) return 'cancelada';
  if (['completada', 'completed'].includes(value)) return 'completada';

  return 'desconocido';
}

// Recibe un timestamp numérico en lugar de un string para evitar recalcular new Date()
function formatBackendDateTime(timestamp: number): string {
  if (Number.isNaN(timestamp)) return '-- --- --:--';

  const date = new Date(timestamp);

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = date.toLocaleDateString('es-CO', { month: 'long' }).toLowerCase();

  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const hours12 = hours % 12 || 12;
  const meridiem = hours >= 12 ? 'pm' : 'am';

  return `${day} ${month} ${hours12}:${minutes} ${meridiem}`;
}

function getVisibleStatusLabel(status: AssemblyStatus): string {
  if (status === 'cancelada') return 'Cancelada';
  return '';
}

function resolveLiveRoute(scope: DashboardScope, roomName: string): string {
  return scope === 'porteria'
    ? `/porteria/citofonia?r=${encodeURIComponent(roomName)}`
    : `/residentes/room?r=${encodeURIComponent(roomName)}`;
}

export default function DashboardNotifications({ scope }: DashboardNotificationsProps) {
  const router = useRouter();
  const { selectedPropertyId, isLoading: isPropertyLoading } = useProperty();

  const [notifications, setNotifications] = useState<AssemblyNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      if (!selectedPropertyId) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAll({
          phs_id: selectedPropertyId,
          fields: DASHBOARD_ASSEMBLY_FIELDS.join(','),
        });
        const data = Array.isArray(response?.data) ? response.data : [];
        console.log("Las asambleas", data);

        // Filtramos y mapeamos en un solo paso
        const mapped = data
          .map((assembly: Assembly): AssemblyNotificationItem => {
            const rawDate = assembly.scheduled_at || assembly.created_at || '';
            const normalized = rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T');
            const timestamp = new Date(normalized).getTime(); // Parseamos la fecha UNA sola vez

            return {
              id: assembly.id || '',
              title: assembly.name || 'Asamblea sin nombre',
              status: normalizeStatus(assembly.status),
              timestamp,
              livekitRoomName: assembly.livekit_room_name,
              dotColor: ASSEMBLY_DOT_COLOR,
            };
          })
          .filter((item) => item.status !== 'completada');

        // Ordenamiento super rápido usando matemáticas simples
        mapped.sort((a, b) => {
          const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Si ambos timestamps son NaN, no cambiamos el orden. Si solo uno lo es, se maneja como 0.
          const timeA = Number.isNaN(a.timestamp) ? 0 : a.timestamp;
          const timeB = Number.isNaN(b.timestamp) ? 0 : b.timestamp;
          
          return timeB - timeA;
        });

        if (!cancelled) {
          setNotifications(mapped);
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!isPropertyLoading) {
      void loadNotifications();
    }

    return () => {
      cancelled = true;
    };
  }, [isPropertyLoading, selectedPropertyId]);

  if (isPropertyLoading || loading) {
    return <LoadingState message="Cargando notificaciones..." />;
  }

  if (!selectedPropertyId) {
    return (
      <section className={styles.notificationsList}>
        <div className={styles.emptyState}>Selecciona una copropiedad para ver notificaciones.</div>
      </section>
    );
  }

  if (notifications.length === 0) {
    return (
      <section className={styles.notificationsList}>
        <div className={styles.emptyState}>No hay notificaciones por el momento.</div>
      </section>
    );
  }

  return (
    <section className={styles.notificationsList}>
      <div className={styles.notificationsScroll} style={{ maxHeight: `${MAX_VISIBLE_NOTIFICATIONS * 72 + 30}px` }}>
        {notifications.map((item) => {
          const statusLabel = getVisibleStatusLabel(item.status);
          const showStatus = statusLabel.length > 0;

          return (
            <div key={item.id} className={styles.notificationItem}>
              <span className={styles.dot} style={{ backgroundColor: item.dotColor }} aria-hidden="true" />

              <div className={styles.content}>
                <div className={styles.metaRow}>
                  {item.status === 'en_progreso' && item.livekitRoomName && (
                    <button
                      type="button"
                      className={styles.liveBadge}
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(resolveLiveRoute(scope, item.livekitRoomName || ''));
                      }}
                    >
                      En directo
                    </button>
                  )}
                  <span className={styles.time}>{formatBackendDateTime(item.timestamp)}</span>
                  {showStatus && <span className={`${styles.status} ${styles.statusCancelled}`}>{statusLabel}</span>}
                </div>
                <span className={styles.title}>{item.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}