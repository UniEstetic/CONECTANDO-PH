import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

// Datos de ejemplo para la bitácora de portería
const REGISTROS_PORTERIA = [
  { 
    id: 1, 
    tipo: 'Visitante', 
    nombre: 'Juan Pérez', 
    detalle: 'Torre 2 - Apto 502', 
    hora: '10:15 AM', 
    estado: 'Ingresó' 
  },
  { 
    id: 2, 
    tipo: 'Correspondencia', 
    nombre: 'Servientrega', 
    detalle: 'Paquete para Torre 1 - 304', 
    hora: '09:30 AM', 
    estado: 'En portería' 
  },
  { 
    id: 3, 
    tipo: 'Vehículo', 
    nombre: 'Placa ABC-123', 
    detalle: 'Parqueadero Visitante 05', 
    hora: '08:45 AM', 
    estado: 'Salió' 
  },
  { 
    id: 4, 
    tipo: 'Domicilio', 
    nombre: 'Rappi', 
    detalle: 'Pedido para Torre 3 - 101', 
    hora: '08:20 AM', 
    estado: 'Entregado' 
  }
];

export default function PorteriaPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerPorteria}>
          <Link href="/admin" className={styles.btnBack}>
            <span>← Volver</span>
          </Link>
          <h1 className={styles.title}>Control de Portería</h1>
        </div>

        {/* Acciones Rápidas */}
        <section className={styles.quickActions}>
          <button className={styles.actionBtn}>
            <Image src="/imagenes/09_boton mis visitantes.svg" alt="Add" width={24} height={24} />
            <span>Autorizar Visita</span>
          </button>
          <button className={styles.actionBtn}>
             {/* Reutilizando tu icono de portería */}
            <Image src="/imagenes/13_boton porteria.svg" alt="Paquete" width={24} height={24} />
            <span>Ver Correspondencia</span>
          </button>
        </section>

        {/* Listado de Actividad Reciente */}
        <section className={styles.logContainer}>
          <h2 className={styles.subTitle}>Actividad de hoy</h2>
          
          <div className={styles.logList}>
            {REGISTROS_PORTERIA.map((reg) => (
              <div key={reg.id} className={styles.logItem}>
                <div className={styles.timeTag}>{reg.hora}</div>
                
                <div className={styles.logInfo}>
                  <div className={styles.logHeader}>
                    <span className={`${styles.typeBadge} ${styles[reg.tipo.toLowerCase()]}`}>
                      {reg.tipo}
                    </span>
                    <span className={`${styles.statusText} ${styles[reg.estado.replace(' ', '').toLowerCase()]}`}>
                      {reg.estado}
                    </span>
                  </div>
                  <h3 className={styles.logTitle}>{reg.nombre}</h3>
                  <p className={styles.logDetail}>{reg.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}