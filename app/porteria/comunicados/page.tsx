import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const COMUNICADOS_PORTERIA = [
  {
    id: 1,
    emisor: 'Administración',
    asunto: 'Suspensión de energía mañana 8:00 AM',
    fecha: 'Hoy',
    prioridad: 'Alta',
    leido: false
  },
  {
    id: 2,
    emisor: 'Consejo',
    asunto: 'Nuevas tarifas parqueadero visitantes',
    fecha: '14 Feb 2026',
    prioridad: 'Media',
    leido: true
  },
  {
    id: 3,
    emisor: 'Mantenimiento',
    asunto: 'Limpieza de tanques de agua Torre 1',
    fecha: '13 Feb 2026',
    prioridad: 'Alta',
    leido: true
  }
];

export default function PorteriaComunicadosPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/porteria" className={styles.btnBack}>
            <span>← Panel</span>
          </Link>
          <h1 className={styles.title}>Buzón de Portería</h1>
        </div>

        {/* Acciones de Difusión */}
        <section className={styles.broadcastSection}>
          <button className={styles.btnNotifyAll}>
            <div className={styles.iconAlert}>📢</div>
            <div className={styles.btnText}>
              <strong>Notificación Masiva</strong>
              <span>Enviar aviso rápido a todos los aptos</span>
            </div>
          </button>
        </section>

        <section className={styles.listSection}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.active}`}>Recibidos</button>
            <button className={styles.tab}>Enviados por Portería</button>
          </div>

          <div className={styles.comunicadosGrid}>
            {COMUNICADOS_PORTERIA.map((msg) => (
              <div 
                key={msg.id} 
                className={`${styles.msgCard} ${!msg.leido ? styles.unread : ''} ${styles[msg.prioridad.toLowerCase()]}`}
              >
                <div className={styles.msgIndicator} />
                
                <div className={styles.msgBody}>
                  <div className={styles.msgHeader}>
                    <span className={styles.emisor}>{msg.emisor}</span>
                    <span className={styles.fecha}>{msg.fecha}</span>
                  </div>
                  <h3 className={styles.asunto}>{msg.asunto}</h3>
                </div>

                <div className={styles.msgActions}>
                  <Link href={`/porteria/comunicados/${msg.id}`} className={styles.btnOpen}>
                    Leer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}