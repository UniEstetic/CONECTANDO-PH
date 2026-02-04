import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image'
import Link from 'next/link'
import UsuariosHeader from '@/app/usuarios/components/UsuariosHeader'

export default function UsuariosAdministrativo() {
  const opciones = [
    {
      titulo: 'Noviembre 12 del 2024',
      descripcion: 'Tienes 4 nuevos PQRS por gestionar'
    },
    {
      titulo: 'Noviembre 13 del 2024',
      descripcion: 'Tienes 5 nuevas reservas de zonas comunes'
    },
    {
      titulo: 'Noviembre 14 del 2024',
      descripcion: 'Tienes un nuevo módulo de capacitación'
    }
  ]

  const accesos = [
    { img: '/imagenes/15_boton mis copropiedades.svg', url: '', alt: 'Mis copropiedades' },
    { img: '/imagenes/16_boton mis usuarios.svg', url: '', alt: 'Mis usuarios' },
    { img: '/imagenes/04_boton comunicados.svg', url: '', alt: 'Comunicados' },
    { img: '/imagenes/05_boton pqrs.svg', url: '', alt: 'PQRS' },
    { img: '/imagenes/06_boton documentos.svg', url: '', alt: 'Documentos' },
    { img: '/imagenes/09_boton mis visitantes.svg', url: '', alt: 'Mis visitantes' },
    { img: '/imagenes/12_boton asambleas.svg', url: '/usuarios/administrativo/menuasambleas', alt: 'Asambleas' },
    { img: '/imagenes/13_boton porteria.svg', url: '', alt: 'Portería' },
    { img: '/imagenes/14_boton formacion.svg', url: '', alt: 'Formación' },
  ]

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>

          <UsuariosHeader />
        
        {/* Lista superior */}
        <section className={styles.list}>
          {opciones.map((opcion, i) => (
            <label key={i} className={styles.item}>
              <span className={styles.fechaResidentes}>{opcion.titulo}</span>
              <div className={styles.containerRadioResidentes}>
                <input type="radio" name="noticia" />
                <span className={styles.text}>{opcion.descripcion}</span>
              </div>
            </label>
          ))}
        </section>

        {/* Accesos */}
        <section className={styles.accessAdministrativo}>
          <div className={styles.blockCards}>
          {accesos.map((item, i) => (
            <div key={i} className={styles.card}>
              <Link href={item.url} className={styles.cardLink}>
                <div className={styles.icon}>
                  <Image
                    src={item.img}
                    alt={item.alt}
                    width={200}
                    height={200}
                  />
                </div>
              </Link>
            </div>
          ))}
          </div>
        </section>
      </main>
    </div>
  )
}