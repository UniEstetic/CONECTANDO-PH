import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const MIS_SOLICITUDES = [
  {
    id: "RAD-2026-001",
    asunto: "Humedad en pared de habitación principal",
    fecha: "12 Feb 2026",
    estado: "En revisión",
    categoria: "Mantenimiento",
    mensajesNuevos: true
  },
  {
    id: "RAD-2026-005",
    asunto: "Ruido excesivo Torre 2 Apt 301",
    fecha: "08 Feb 2026",
    estado: "Cerrado",
    categoria: "Convivencia",
    mensajesNuevos: false
  },
  {
    id: "RAD-2026-009",
    asunto: "Duda sobre cobro de expensas comunes",
    fecha: "01 Feb 2026",
    estado: "Resuelto",
    categoria: "Tesorería",
    mensajesNuevos: false
  }
];

export default function PqrsResidentesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerPqrs}>
          <Link href="/residentes" className={styles.btnBack}>
            <span>← Inicio</span>
          </Link>
          <h1 className={styles.title}>Mis Peticiones y Quejas</h1>
        </div>

        {/* Botón de Acción Principal */}
        <section className={styles.actionSection}>
          <Link href="/residentes/pqrs/nuevo" className={styles.btnNuevoPqrs}>
            <div className={styles.iconPlus}>+</div>
            <div className={styles.textBtn}>
              <strong>Crear nueva solicitud</strong>
              <span>Petición, queja, reclamo o sugerencia</span>
            </div>
          </Link>
        </section>

        {/* Listado de solicitudes */}
        <section className={styles.listSection}>
          <h2 className={styles.subTitle}>Historial de mis radicados</h2>
          
          <div className={styles.pqrsContainer}>
            {MIS_SOLICITUDES.map((solicitud) => (
              <Link 
                href={`/residentes/pqrs/${solicitud.id}`} 
                key={solicitud.id}
                className={styles.pqrsCard}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.radicado}>#{solicitud.id}</span>
                  <span className={`${styles.estadoBadge} ${styles[solicitud.estado.replace(/\s+/g, '').toLowerCase()]}`}>
                    {solicitud.estado}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.asunto}>{solicitud.asunto}</h3>
                  <div className={styles.metaInfo}>
                    <span>{solicitud.categoria}</span>
                    <span className={styles.separator}>•</span>
                    <span>{solicitud.fecha}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  {solicitud.mensajesNuevos ? (
                    <span className={styles.newMessage}>
                      <span className={styles.dot}></span>
                      Tienes una nueva respuesta
                    </span>
                  ) : (
                    <span className={styles.viewLink}>Ver historial de mensajes</span>
                  )}
                  <div className={styles.arrow}>→</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}