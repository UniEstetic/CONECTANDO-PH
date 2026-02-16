import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const MIS_VISITANTES = [
  {
    id: 1,
    nombre: 'Laura Sofía Torres',
    parentesco: 'Familiar',
    fecha: 'Hoy, 15 Feb 2026',
    estado: 'En sitio', // El visitante ya cruzó la portería
    tipo: 'Peatonal'
  },
  {
    id: 2,
    nombre: 'Marcos Aurelio (Uber)',
    parentesco: 'Domicilio',
    fecha: 'Hoy, 15 Feb 2026',
    estado: 'Autorizado', // Pendiente por llegar
    tipo: 'Vehicular'
  },
  {
    id: 3,
    nombre: 'Carlos Ruiz',
    parentesco: 'Amigo',
    fecha: 'Ayer, 14 Feb 2026',
    estado: 'Finalizado',
    tipo: 'Peatonal'
  }
];

export default function VisitantesResidentesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/residentes" className={styles.btnBack}>
            <span>← Inicio</span>
          </Link>
          <h1 className={styles.title}>Mis Visitantes</h1>
        </div>

        {/* Botón de Acción Rápida */}
        <section className={styles.mainActions}>
          <button className={styles.btnAutorizar}>
            <div className={styles.plusCircle}>+</div>
            <span>Autorizar Nuevo Ingreso</span>
          </button>
        </section>

        {/* Listado de visitas */}
        <section className={styles.listSection}>
          <h2 className={styles.subTitle}>Actividad Reciente</h2>
          
          <div className={styles.visitContainer}>
            {MIS_VISITANTES.map((visita) => (
              <div key={visita.id} className={`${styles.visitCard} ${styles[visita.estado.replace(/\s+/g, '').toLowerCase()]}`}>
                <div className={styles.cardMain}>
                  <div className={styles.iconType}>
                    {/* Cambia el icono según si es vehicular o peatonal */}
                    {visita.tipo === 'Vehicular' ? '🚗' : '👤'}
                  </div>
                  
                  <div className={styles.info}>
                    <h3 className={styles.name}>{visita.nombre}</h3>
                    <p className={styles.meta}>{visita.parentesco} • {visita.fecha}</p>
                  </div>

                  <div className={styles.statusBadge}>
                    {visita.estado}
                  </div>
                </div>

                {visita.estado === 'Autorizado' && (
                  <div className={styles.cardFooter}>
                    <button className={styles.btnShare}>Compartir Ubicación</button>
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