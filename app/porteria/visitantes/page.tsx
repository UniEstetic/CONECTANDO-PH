import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const INGRESOS_RECIENTES = [
  {
    id: 1,
    nombre: 'Ricardo Montaner',
    documento: '1.090.888.777',
    destino: 'Torre 2 - 401',
    tipo: 'Peatonal',
    horaIngreso: '10:30 AM',
    estado: 'En Sitio'
  },
  {
    id: 2,
    nombre: 'Delivery - Pizza Hut',
    documento: 'N/A',
    destino: 'Torre 1 - 105',
    tipo: 'Motocicleta',
    horaIngreso: '10:45 AM',
    estado: 'En Sitio'
  },
  {
    id: 3,
    nombre: 'Sofía Vergara',
    documento: '52.444.333',
    destino: 'Torre 3 - 902',
    tipo: 'Vehicular (ABC-123)',
    horaIngreso: '09:00 AM',
    estado: 'Salió'
  }
];

export default function PorteriaVisitantesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/porteria" className={styles.btnBack}>
            <span>← Panel</span>
          </Link>
          <h1 className={styles.title}>Control de Visitantes</h1>
        </div>

        {/* Acciones Rápidas de Portería */}
        <section className={styles.quickActions}>
          <button className={styles.btnScan}>
            <div className={styles.icon}>📷</div>
            <span>Escanear QR / Cédula</span>
          </button>
          <button className={styles.btnManual}>
            <div className={styles.icon}>✍️</div>
            <span>Registro Manual</span>
          </button>
        </section>

        {/* Buscador de Autorizaciones */}
        <section className={styles.authSearch}>
          <h2 className={styles.subTitle}>Buscar Autorización de Residente</h2>
          <div className={styles.searchWrapper}>
            <input type="text" placeholder="Apto (Ej: 1-101) o Nombre..." className={styles.inputSearch} />
            <button className={styles.btnGo}>Buscar</button>
          </div>
        </section>

        {/* Listado de Movimientos */}
        <section className={styles.historySection}>
          <div className={styles.listHeader}>
            <span>Visitante / Destino</span>
            <span>Acción</span>
          </div>

          <div className={styles.visitList}>
            {INGRESOS_RECIENTES.map((visita) => (
              <div key={visita.id} className={styles.visitCard}>
                <div className={styles.visitMain}>
                  <div className={styles.visitInfo}>
                    <span className={styles.destiny}>{visita.destino}</span>
                    <h3 className={styles.visitorName}>{visita.nombre}</h3>
                    <p className={styles.visitorMeta}>{visita.tipo} • {visita.horaIngreso}</p>
                  </div>
                  
                  <div className={styles.visitStatus}>
                    {visita.estado === 'En Sitio' ? (
                      <button className={styles.btnExit}>Registrar Salida</button>
                    ) : (
                      <span className={styles.exitLabel}>Salió {visita.horaIngreso}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}