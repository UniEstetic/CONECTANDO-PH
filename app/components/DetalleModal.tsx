import styles from '@/app/ui/styles/usuarios.module.css'
import Image from 'next/image';


interface Comunicado {
  id: number
  fecha: string
  titulo: string
  tipo: 'detalle' | 'encuesta'
  descripcion?: string
}

interface DetalleModalProps {
  comunicado: Comunicado
  onClose: () => void
}

export default function DetalleModal({
  comunicado,
  onClose,
}: DetalleModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <Image
            src="/imagenes/flecha-regreso.png"
            alt="Volver"
            width={25}
            height={25}
          />
        </button>
        <span className={styles.fecha}>{comunicado.fecha}</span>

        <h2 className={styles.titulo}>{comunicado.titulo}</h2>

        <p className={styles.descripcion}>
          {comunicado.descripcion}
        </p>

        <button className={styles.btnCerrar} onClick={onClose}>
          Lectura confirmada
        </button>
      </div>
    </div>
  )
}
