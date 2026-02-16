import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const MODULOS_FORMACION = [
  {
    id: 1,
    titulo: 'Inducción para nuevos copropietarios',
    duracion: '20 min',
    progreso: 100,
    estado: 'Completado',
    imagen: '/imagenes/curso_induccion.jpg' // O un placeholder
  },
  {
    id: 2,
    titulo: 'Protocolos de seguridad y emergencias',
    duracion: '45 min',
    progreso: 45,
    estado: 'En curso',
    imagen: '/imagenes/curso_seguridad.jpg'
  },
  {
    id: 3,
    titulo: 'Manejo de residuos y reciclaje',
    duracion: '15 min',
    progreso: 0,
    estado: 'Pendiente',
    imagen: '/imagenes/curso_reciclaje.jpg'
  }
];

export default function FormacionPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerFormacion}>
          <Link href="/admin" className={styles.btnBack}>
            <span>← Panel Principal</span>
          </Link>
          <h1 className={styles.title}>Mis Capacitaciones</h1>
        </div>

        <section className={styles.gridFormacion}>
          {MODULOS_FORMACION.map((modulo) => (
            <article key={modulo.id} className={styles.courseCard}>
              <div className={styles.imageContainer}>
                {/* Usamos el icono de formación si no hay fotos reales */}
                <Image 
                  src="/imagenes/14_boton formacion.svg" 
                  alt={modulo.titulo}
                  width={60}
                  height={60}
                  className={styles.courseIcon}
                />
              </div>

              <div className={styles.courseContent}>
                <span className={`${styles.statusBadge} ${styles[modulo.estado.replace(' ', '').toLowerCase()]}`}>
                  {modulo.estado}
                </span>
                <h3 className={styles.courseTitle}>{modulo.titulo}</h3>
                <p className={styles.duration}>Duración estimada: {modulo.duracion}</p>
                
                {/* Barra de Progreso Visual */}
                <div className={styles.progressWrapper}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${modulo.progreso}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{modulo.progreso}%</span>
                </div>

                <Link href={`/formacion/modulo/${modulo.id}`} className={styles.btnStart}>
                  {modulo.progreso === 0 ? 'Iniciar módulo' : 'Continuar'}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}