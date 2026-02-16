import styles from '@/app/ui/styles/headerUsuarios.module.css'
import LogoUsuarios from '@/app/components/logo_usuarios'
import LogoutPage from "@/app/auth/login/logout";

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
