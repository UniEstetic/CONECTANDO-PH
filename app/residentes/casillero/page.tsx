import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const PAQUETES = [
  {
    id: 'REF-9920',
    empresa: 'Amazon / Servientrega',
    descripcion: 'Caja mediana sellada',
    fechaLlegada: '15 Feb 2026',
    hora: '14:30',
    estado: 'Pendiente', // Pendiente por recoger
    recibidoPor: 'Guarda: Wilson Castro'
  },
  {
    id: 'REF-8841',
    empresa: 'Mercado Libre',
    descripcion: 'Sobre de burbujas',
    fechaLlegada: '12 Feb 2026',
    hora: '09:15',
    estado: 'Entregado', // Ya lo recogió el residente
    recibidoPor: 'Guarda: Elena Ruiz'
  },
  {
    id: 'REF-7722',
    empresa: 'Recibo de Energía',
    descripcion: 'Correspondencia física',
    fechaLlegada: '10 Feb 2026',
    hora: '11:00',
    estado: 'Entregado',
    recibidoPor: 'Guarda: Wilson Castro'
  }
];

export default function CasilleroPage() {
  // Filtramos para contar cuántos pendientes hay
  const pendientes = PAQUETES.filter(p => p.estado === 'Pendiente').length;

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerCasillero}>
          <Link href="/residentes" className={styles.btnBack}>
            <span>← Panel</span>
          </Link>
          <h1 className={styles.title}>Mi Casillero Virtual</h1>
        </div>

        {/* Resumen de alertas */}
        <section className={styles.alertBanner}>
          <div className={pendientes > 0 ? styles.alertActive : styles.alertEmpty}>
            <div className={styles.alertIcon}>📦</div>
            <div className={styles.alertText}>
              {pendientes > 0 
                ? `Tienes ${pendientes} paquete(s) esperando en portería.` 
                : 'No tienes correspondencia pendiente.'}
            </div>
          </div>
        </section>

        <section className={styles.listSection}>
          <h2 className={styles.subTitle}>Historial de Recepción</h2>
          
          <div className={styles.packageList}>
            {PAQUETES.map((paquete) => (
              <div key={paquete.id} className={`${styles.packageCard} ${styles[paquete.estado.toLowerCase()]}`}>
                <div className={styles.packageHeader}>
                  <span className={styles.packageId}>{paquete.id}</span>
                  <span className={styles.packageTime}>{paquete.fechaLlegada} - {paquete.hora}</span>
                </div>

                <div className={styles.packageBody}>
                  <h3 className={styles.companyName}>{paquete.empresa}</h3>
                  <p className={styles.description}>{paquete.descripcion}</p>
                  <p className={styles.receivedBy}>{paquete.recibidoPor}</p>
                </div>

                <div className={styles.packageFooter}>
                  <div className={styles.statusIndicator}>
                    <span className={styles.dot}></span>
                    {paquete.estado}
                  </div>
                  {paquete.estado === 'Pendiente' && (
                    <button className={styles.btnNotify}>Recordarme luego</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}