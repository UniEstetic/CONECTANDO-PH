import styles from '../../ui/styles/headerUsuarios.module.css'
import LogoUsuarios from '@/app/usuarios/components/logo_usuarios'
import LogoutPage from "@/app/login/logout";

export default function UsuariosHeader() {
  return (
    <div className={styles.headerUsuariosPropiedad}>
      <LogoutPage/>
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
