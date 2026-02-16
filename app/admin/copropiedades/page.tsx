import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const MIS_COPROPIEDADES = [
  {
    id: 1,
    nombre: 'Conjunto Residencial Sendero Real',
    direccion: 'Calle 123 # 45-67',
    ciudad: 'Bogotá',
    unidades: 120,
    imagen: '/imagenes/copropiedad_1.jpg',
    rol: 'Administrador'
  },
  {
    id: 2,
    nombre: 'Edificio Mirador del Parque',
    direccion: 'Carrera 10 # 88-12',
    ciudad: 'Medellín',
    unidades: 45,
    imagen: '/imagenes/copropiedad_2.jpg',
    rol: 'Consejo'
  },
  {
    id: 3,
    nombre: 'Urbanización Los Olivos',
    direccion: 'Transversal 5 # 22-10',
    ciudad: 'Cali',
    unidades: 200,
    imagen: '/imagenes/copropiedad_3.jpg',
    rol: 'Administrador'
  }
];

export default function CopropiedadesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerCopropiedades}>
          <Link href="/admin" className={styles.btnBack}>
            <span>← Volver</span>
          </Link>
          <div className={styles.titleInfo}>
            <h1 className={styles.title}>Mis Copropiedades</h1>
            <p className={styles.subtitle}>Selecciona una copropiedad para gestionar</p>
          </div>
        </div>

        <section className={styles.gridCopropiedades}>
          {MIS_COPROPIEDADES.map((ph) => (
            <div key={ph.id} className={styles.phCard}>
              <div className={styles.imageWrapper}>
                {/* Imagen de la copropiedad o placeholder */}
                <div className={styles.placeholderImg}>
                   <Image 
                    src="/imagenes/15_boton mis copropiedades.svg" 
                    alt="PH" 
                    width={50} 
                    height={50} 
                    className={styles.iconOverlay}
                  />
                </div>
                <span className={styles.roleTag}>{ph.rol}</span>
              </div>

              <div className={styles.phContent}>
                <h3 className={styles.phName}>{ph.nombre}</h3>
                <p className={styles.phAddress}>{ph.direccion} - {ph.ciudad}</p>
                
                <div className={styles.phStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{ph.unidades}</span>
                    <span className={styles.statLabel}>Unidades</span>
                  </div>
                </div>

                <Link href={`/phs/unidades/${ph.id}`} className={styles.btnEnter}>
                  Gestionar Copropiedad
                </Link>
              </div>
            </div>
          ))}

          {/* Botón para agregar nueva copropiedad (solo si es superadmin) */}
          <button className={styles.btnAddPH}>
            <span className={styles.plusIcon}>+</span>
            <span>Vincular Nueva Copropiedad</span>
          </button>
        </section>
      </main>
    </div>
  );
}