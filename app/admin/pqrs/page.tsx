import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const MIS_PQRS = [
  {
    id: "PQRS-1024",
    asunto: "Filtración en techo garaje",
    fecha: "12 Nov 2024",
    estado: "En proceso",
    prioridad: "Alta",
  },
  {
    id: "PQRS-0985",
    asunto: "Ruido excesivo apto 402",
    fecha: "10 Nov 2024",
    estado: "Cerrado",
    prioridad: "Media",
  },
  {
    id: "PQRS-0812",
    asunto: "Sugerencia iluminación sendero",
    fecha: "05 Nov 2024",
    estado: "Abierto",
    prioridad: "Baja",
  }
];

export default function PQRSPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerPQRS}>
          <Link href="/admin" className={styles.btnBack}>
            <span>← Panel</span>
          </Link>
          <h1 className={styles.title}>Gestión de PQRS</h1>
        </div>

        {/* Botón Principal de Acción */}
        <section className={styles.createSection}>
          <button className={styles.btnCreate}>
            <span className={styles.plusIcon}>+</span>
            Nueva Solicitud
          </button>
        </section>

        {/* Listado de Solicitudes */}
        <section className={styles.listSection}>
          <h2 className={styles.subTitle}>Mis Solicitudes Recientes</h2>
          
          <div className={styles.pqrsList}>
            {MIS_PQRS.map((pqrs) => (
              <div key={pqrs.id} className={styles.pqrsCard}>
                <div className={styles.pqrsMainInfo}>
                  <div className={styles.pqrsId}>{pqrs.id}</div>
                  <h3 className={styles.pqrsAsunto}>{pqrs.asunto}</h3>
                  <p className={styles.pqrsFecha}>Radicado el: {pqrs.fecha}</p>
                </div>

                <div className={styles.pqrsStatusInfo}>
                  {/* Badge de Prioridad */}
                  <span className={`${styles.prioridadBadge} ${styles[pqrs.prioridad.toLowerCase()]}`}>
                    {pqrs.prioridad}
                  </span>
                  
                  {/* Estado con color dinámico */}
                  <div className={styles.statusRow}>
                    <span className={`${styles.statusDot} ${styles[pqrs.estado.replace(/\s+/g, '').toLowerCase()]}`}></span>
                    <span className={styles.statusText}>{pqrs.estado}</span>
                  </div>
                </div>

                <Link href={`/pqrs/${pqrs.id}`} className={styles.btnDetails}>
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}