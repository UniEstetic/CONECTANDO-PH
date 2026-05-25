import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const ZONAS = [
  {
    id: 1,
    nombre: 'Salón Social',
    capacidad: '50 personas',
    estado: 'Disponible',
    precio: '$50.000 / día',
    imagen: '/imagenes/04_boton comunicados.svg' // Reemplazar con foto real
  },
  {
    id: 2,
    nombre: 'Zona BBQ',
    capacidad: '10 personas',
    estado: 'Reservado hoy',
    precio: 'Gratuito',
    imagen: '/imagenes/04_boton comunicados.svg'
  },
  {
    id: 3,
    nombre: 'Cancha Sintética',
    capacidad: '12 personas',
    estado: 'Mantenimiento',
    precio: '$20.000 / hora',
    imagen: '/imagenes/04_boton comunicados.svg'
  }
];

export default function ZonasComunesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/residentes" className={styles.btnBack}>
          </Link>
          <h1 className={styles.title}>Zonas Comunes</h1>
        </div>

        {/* Mis Reservas Activas */}
        <section className={styles.myReservations}>
          <h2 className={styles.subTitle}>Mis próximas reservas</h2>
          <div className={styles.reservationAlert}>
            <span className={styles.resIcon}>📅</span>
            <div className={styles.resInfo}>
              <p><strong>Salón Social</strong></p>
              <p>Sábado, 21 de Febrero - 2:00 PM</p>
            </div>
            <span className={styles.resStatus}>Confirmado</span>
          </div>
        </section>

        {/* Catálogo de Zonas */}
        <section className={styles.gridZonas}>
          <h2 className={styles.subTitle}>Espacios disponibles</h2>
          {ZONAS.map((zona) => (
            <div key={zona.id} className={`${styles.zonaCard} ${styles[zona.estado.replace(/\s+/g, '').toLowerCase()]}`}>
              <div className={styles.zonaImage}>
                 {/* Aquí iría la foto de la zona */}
                 <span className={styles.priceTag}>{zona.precio}</span>
              </div>
              
              <div className={styles.zonaBody}>
                <div className={styles.zonaHeader}>
                  <h3 className={styles.zonaName}>{zona.nombre}</h3>
                  <span className={styles.statusBadge}>{zona.estado}</span>
                </div>
                
                <p className={styles.zonaDesc}>Capacidad máxima: {zona.capacidad}</p>
                
                <button 
                  className={styles.btnReserve}
                  disabled={zona.estado === 'Mantenimiento'}
                >
                  {zona.estado === 'Mantenimiento' ? 'No disponible' : 'Reservar espacio'}
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}