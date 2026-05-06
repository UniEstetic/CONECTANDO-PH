import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image'
import Link from 'next/link';

import UsuariosHeader from '@/app/components/UsuariosHeader'
import DashboardNotifications from '@/app/components/DashboardNotifications';

export default function UsuariosResidente() {
  const accesos = [
    { img: '/imagenes/04_boton comunicados.svg', url: "/porteria/comunicados" },
    { img: '/imagenes/16_boton citofonia.svg', url: "/porteria/citofonia" },
    { img: '/imagenes/08_boton mi casillero.svg', url: "/porteria/casillero" },
    { img: '/imagenes/09_boton mis visitantes.svg', url: "/porteria/visitantes" },
  ]

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>

          <UsuariosHeader />
        
        <DashboardNotifications scope="porteria" />

        {/* Accesos */}
        <section className={styles.access}>
          {accesos.map((item, i) => (
            <div key={i} className={styles.card}>
              <Link href={item?.url} className={styles.icon}>
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
