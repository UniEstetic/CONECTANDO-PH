import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const PAQUETES_PORTERIA = [
  {
    id: 1,
    apto: 'Torre 1 - 502',
    remitente: 'Mercado Libre',
    tipo: 'Caja Pequeña',
    fecha: '15 Feb 2026',
    hora: '14:20',
    estado: 'En Guarda',
    imagen: '/imagenes/06_boton documentos.svg'
  },
  {
    id: 2,
    apto: 'Torre 2 - 101',
    remitente: 'Amazon',
    tipo: 'Sobre',
    fecha: '15 Feb 2026',
    hora: '15:45',
    estado: 'En Guarda',
    imagen: '/imagenes/06_boton documentos.svg'
  },
  {
    id: 3,
    apto: 'Torre 1 - 203',
    remitente: 'Servientrega',
    tipo: 'Caja Grande',
    fecha: '14 Feb 2026',
    hora: '09:10',
    estado: 'Entregado',
    imagen: '/imagenes/06_boton documentos.svg'
  }
];

export default function PorteriaCasilleroPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/porteria" className={styles.btnBack}>
            <span>← Panel Portería</span>
          </Link>
          <h1 className={styles.title}>Gestión de Casillero</h1>
        </div>

        {/* Acciones de Portero */}
        <section className={styles.porteroActions}>
          <button className={styles.btnRegister}>
            <span className={styles.plusIcon}>+</span>
            Registrar Nuevo Paquete
          </button>
        </section>

        {/* Filtro por Apto */}
        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Buscar por Torre o Apto..." 
            className={styles.searchInput}
          />
        </section>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <span>Ubicación / Paquete</span>
            <span>Estado</span>
          </div>

          <div className={styles.packageGrid}>
            {PAQUETES_PORTERIA.map((pkg) => (
              <div key={pkg.id} className={`${styles.pkgCard} ${pkg.estado === 'Entregado' ? styles.delivered : ''}`}>
                <div className={styles.pkgInfo}>
                  <div className={styles.pkgApto}>{pkg.apto}</div>
                  <div className={styles.pkgDetail}>
                    <strong>{pkg.remitente}</strong> • {pkg.tipo}
                  </div>
                  <div className={styles.pkgTime}>Recibido: {pkg.hora}</div>
                </div>

                <div className={styles.pkgActions}>
                  {pkg.estado === 'En Guarda' ? (
                    <button className={styles.btnDeliver}>
                      Entregar
                    </button>
                  ) : (
                    <span className={styles.deliveredLabel}>✓ Entregado</span>
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