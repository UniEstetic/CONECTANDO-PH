import styles from '@/app/ui/styles/usuarios.module.css'
import Image from 'next/image';


interface OpcionEncuesta {
  id: number
  texto: string
  votos: number
}

interface Comunicado {
  id: number
  fecha: string
  titulo: string
  tipo: 'detalle' | 'encuesta'
  pregunta?: string
  opciones?: OpcionEncuesta[]
}

interface EncuestaModalProps {
  comunicado: Comunicado
  onClose: () => void
}

export default function EncuestaModal({
  comunicado,
  onClose,
}: EncuestaModalProps) {
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

        <p className={styles.pregunta}>{comunicado.pregunta}</p>

        <div className={styles.opciones}>
          {comunicado.opciones?.map((opcion) => (
            <label key={opcion.id} className={styles.opcion}>
              <input type="radio" name="encuesta" />
              <span className={styles.opcionTexto}>
                {opcion.texto}
              </span>
              <span className={styles.votos}>
                {opcion.votos}
              </span>
            </label>
          ))}
        </div>

        <button className={styles.btnCerrar} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
