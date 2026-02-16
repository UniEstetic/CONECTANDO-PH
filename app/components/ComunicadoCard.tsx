import styles from '@/app/ui/styles/usuarios.module.css'

interface ComunicadoCardProps {
  fecha: string
  titulo: string
  tipo: 'detalle' | 'encuesta'
  onClick: () => void
}

export default function ComunicadoCard({
  fecha,
  titulo,
  tipo,
  onClick,
}: ComunicadoCardProps) {
  const textoBoton =
    tipo === 'encuesta' ? 'Ver encuesta' : 'Ver detalle'

  return (
    <div className={styles.cardComunicados}>
      <span className={styles.fecha}>{fecha}</span>
      <p className={styles.titulo}>{titulo}</p>
      <button onClick={onClick}>{textoBoton}</button>
    </div>
  )
}
