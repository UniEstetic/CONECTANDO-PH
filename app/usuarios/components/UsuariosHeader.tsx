import styles from '../../ui/styles/headerUsuarios.module.css'
import LogoUsuarios from '@/app/usuarios/components/logo_usuarios'

export default function UsuariosHeader() {
  return (
    <div className={styles.headerUsuariosPropiedad}>
      <LogoUsuarios />

      <div className={styles.blockName}>
          <p className={styles.saludo}>
            Hola, 
          </p>
          <strong className={styles.saludoName}>Andrés</strong>
      </div>
    </div>
  )
}
