import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image'
import UsuariosHeader from '@/app/components/UsuariosHeader'
import Link from 'next/link'
import DashboardNotifications from '@/app/components/DashboardNotifications';

export default function UsuariosResidente() {
  const accesos = [
    { img: '/imagenes/04_boton comunicados.svg', url: '/residentes/comunicados' },
    { img: '/imagenes/05_boton pqrs.svg', url: '/residentes/pqrs' },
    { img: '/imagenes/06_boton documentos.svg', url: '/residentes/documentos' },
    { img: '/imagenes/07_boton reserva zonas.svg', url: '/residentes/zonas-comunes' },
    { img: '/imagenes/08_boton mi casillero.svg', url: '/residentes/casillero' },
    { img: '/imagenes/09_boton mis visitantes.svg', url: '/residentes/visitantes' },
  ]

  return (
    <div className={styles.blockResidentes}>
    <main className={styles.containerResidentes}>
        <UsuariosHeader />
      <DashboardNotifications scope="residentes" />

      {/* Accesos */}
      <section className={styles.access}>
        {accesos.map((item, i) => (
          <div key={i} className={styles.card}>
            <Link href={item.url} className={styles.icon}>
              <Image
                src={item.img}
                alt="Residente o propietario"
                width={200}
                height={200}
              />
            </Link>
          </div>
        ))}
      </section>

    </main>
    </div>
  )
}
