import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const VISITANTES = [
  {
    id: 1,
    nombre: 'Roberto Cano',
    documento: '1.020.334.555',
    fecha: 'Hoy, 15 Feb 2026',
    tipo: 'Familiar',
    estado: 'En sitio',
    avatar: '/imagenes/user-avatar.svg'
  },
  {
    id: 2,
    nombre: 'Paola Méndez',
    documento: '52.888.123',
    fecha: 'Mañana, 16 Feb 2026',
    tipo: 'Servicio Técnico',
    estado: 'Programado',
    avatar: ''
  },
  {
    id: 3,
    nombre: 'Uber - Domicilio',
    documento: 'N/A',
    fecha: '14 Feb 2026',
    tipo: 'Domicilio',
    estado: 'Finalizado',
    avatar: ''
  }
];

export default function VisitantesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerVisitantes}>
          <Link href="/admin" className={styles.btnBack}>
            <span>← Volver</span>
          </Link>
          <h1 className={styles.title}>Control de Visitantes</h1>
        </div>

        {/* Acciones principales */}
        <section className={styles.actionGrid}>
          <button className={styles.mainActionBtn}>
            <div className={styles.iconCircle}>+</div>
            <span>Pre-autorizar Visita</span>
          </button>
          <button className={styles.secondaryActionBtn}>
            <Image src="/imagenes/09_boton mis visitantes.svg" alt="QR" width={24} height={24} />
            <span>Generar Invitación QR</span>
          </button>
        </section>

        {/* Listado de Visitantes */}
        <section className={styles.listSection}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.active}`}>Todos</button>
            <button className={styles.tab}>En Sitio</button>
            <button className={styles.tab}>Programados</button>
          </div>

          <div className={styles.visitList}>
            {VISITANTES.map((visita) => (
              <div key={visita.id} className={styles.visitCard}>
                <div className={styles.visitHeader}>
                  <div className={styles.visitAvatar}>
                    {visita.nombre.charAt(0)}
                  </div>
                  <div className={styles.visitMainInfo}>
                    <h3 className={styles.visitName}>{visita.nombre}</h3>
                    <span className={styles.visitDoc}>{visita.documento}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[visita.estado.replace(' ', '').toLowerCase()]}`}>
                    {visita.estado}
                  </span>
                </div>

                <div className={styles.visitDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Fecha:</span>
                    <span className={styles.value}>{visita.fecha}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Tipo:</span>
                    <span className={styles.value}>{visita.tipo}</span>
                  </div>
                </div>

                {visita.estado === 'Programado' && (
                  <div className={styles.cardActions}>
                    <button className={styles.btnEdit}>Editar</button>
                    <button className={styles.btnCancel}>Cancelar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}