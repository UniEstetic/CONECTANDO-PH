import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image'
import UsuariosHeader from '@/app/usuarios/components/UsuariosHeader'

export default function UsuariosResidente() {
  const opciones = [
    'Recomendaciones para el turno de la noche',
    'Ascensor torre 2 en mantenimiento',
    'Pendientes de las mascotas',
  ]

  const accesos = [
    { img: '/imagenes/04_boton comunicados.svg' },
    { img: '/imagenes/16_boton citofonia.svg' },
    { img: '/imagenes/08_boton mi casillero.svg' },
    { img: '/imagenes/09_boton mis visitantes.svg' },
  ]

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>

          <UsuariosHeader />
        
        {/* Lista superior */}
        <section className={styles.list}>
          {opciones.map((texto, i) => (
            <label key={i} className={styles.item}>
              <input type="radio" name="noticia" />
              <span className={styles.text}>{texto}</span>
            </label>
          ))}
        </section>

        {/* Accesos */}
        <section className={styles.access}>
          {accesos.map((item, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>
                <Image
                  src={item.img}
                  alt="Residente o propietario"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  )
}
