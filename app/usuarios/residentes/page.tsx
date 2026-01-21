import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image'
import UsuariosHeader from '@/app/usuarios/components/UsuariosHeader'

export default function UsuariosResidente() {
  const opciones = [
  {
    titulo: 'Noviembre 12 del 2024',
    descripcion: 'Acta de asamblea marzo 25 de 2025',
  },
  {
    titulo: 'Noviembre 14 del 2024',
    descripcion: 'Mantenimiento ascensores torre 4 este 12 de diciembre',
  },
  {
    titulo: 'Noviembre 15 del 2024',
    descripcion: 'Tienes un nuevo paquete en tu casillero',
  },
  {
    titulo: 'Noviembre 16 del 2024',
    descripcion: 'Si tienes mascotas debes saber esto',
  },
]


  const accesos = [
    { img: '/imagenes/04_boton comunicados.svg' },
    { img: '/imagenes/05_boton pqrs.svg' },
    { img: '/imagenes/06_boton documentos.svg' },
    { img: '/imagenes/07_boton reserva zonas.svg' },
    { img: '/imagenes/08_boton mi casillero.svg' },
    { img: '/imagenes/09_boton mis visitantes.svg' },
  ]

  return (
    <div className={styles.blockResidentes}>
    <main className={styles.containerResidentes}>
        <UsuariosHeader />
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
