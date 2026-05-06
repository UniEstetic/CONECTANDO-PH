import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image'
import Link from 'next/link'
import UsuariosHeader from '@/app/components/UsuariosHeader'
import DashboardNotifications from '@/app/components/DashboardNotifications';

export default function UsuariosAdministrativo() {
  const accesos = [
    { img: '/imagenes/15_boton mis copropiedades.svg', url: '/admin/copropiedades', alt: 'Mis copropiedades' },
    { img: '/imagenes/16_boton mis usuarios.svg', url: '/admin/usuarios', alt: 'Mis usuarios' },
    { img: '/imagenes/04_boton comunicados.svg', url: '/admin/comunicados', alt: 'Comunicados' },
    { img: '/imagenes/05_boton pqrs.svg', url: '/admin/pqrs', alt: 'PQRS' },
    { img: '/imagenes/06_boton documentos.svg', url: '/admin/documentos', alt: 'Documentos' },
    { img: '/imagenes/09_boton mis visitantes.svg', url: '/admin/visitantes', alt: 'Mis visitantes' },
    { img: '/imagenes/12_boton asambleas.svg', url: '/admin/asambleas', alt: 'Asambleas' },
    { img: '/imagenes/13_boton porteria.svg', url: '/admin/porteria', alt: 'Portería' },
    { img: '/imagenes/14_boton formacion.svg', url: '/admin/formacion', alt: 'Formación' },
  ]

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>

          <UsuariosHeader />
        
        <DashboardNotifications scope="admin" />

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