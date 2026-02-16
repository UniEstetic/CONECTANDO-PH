import styles from '@/app/ui/styles/usuarios.module.css';
import Link from 'next/link';
import Image from 'next/image';
import UsuariosHeader from '@/app/components/UsuariosHeader';

// Estructura de datos para el listado
const COMUNICADOS_LISTA = [
  { id: 1, fecha: '15 Nov 2024', remitente: 'Administración', asunto: 'Mantenimiento de ascensores Torre 2', estado: 'No leído' },
  { id: 2, fecha: '14 Nov 2024', remitente: 'Consejo', asunto: 'Convocatoria a Asamblea Extraordinaria', estado: 'Leído' },
  { id: 3, fecha: '12 Nov 2024', remitente: 'Seguridad', asunto: 'Recordatorio uso de parqueaderos visitantes', estado: 'Leído' },
  { id: 4, fecha: '10 Nov 2024', remitente: 'Administración', asunto: 'Recibo de administración disponible', estado: 'Leído' },
  { id: 5, fecha: '08 Nov 2024', remitente: 'Jardinería', asunto: 'Fumigación de zonas verdes', estado: 'Leído' },
];

export default function ComunicadosPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerComunicados}>
          <Link href="/admin" className={styles.btnBack}>
            <Image src="/imagenes/arrow-left.svg" alt="Volver" width={20} height={20} />
            <span>Volver</span>
          </Link>
          <h1 className={styles.title}>Listado de Comunicados</h1>
        </div>

        <section className={styles.listSection}>
          <div className={styles.tableHeader}>
            <span className={styles.col}>Fecha</span>
            <span className={styles.col}>Asunto</span>
            <span className={styles.col}>Estado</span>
          </div>

          <div className={styles.itemsContainer}>
            {COMUNICADOS_LISTA.map((item) => (
              <Link 
                href={`/comunicados/${item.id}`} 
                key={item.id} 
                className={`${styles.itemRow} ${item.estado === 'No leído' ? styles.unread : ''}`}
              >
                <div className={styles.dateCol}>{item.fecha}</div>
                <div className={styles.subjectCol}>
                  <p className={styles.sender}>{item.remitente}</p>
                  <p className={styles.subjectText}>{item.asunto}</p>
                </div>
                <div className={styles.statusCol}>
                  <span className={styles.statusBadge}>{item.estado}</span>
                </div>
                <div className={styles.arrowCol}>
                   {/* Icono de flecha simple */}
                   <span>{'>'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}