import styles from '@/app/ui/styles/usuarios.module.css';

import LogoUsuarios from '@/app/usuarios/components/logo_usuarios';
import LogoutPage from "@/app/login/logout";

export default function Header() {
  return (
    <div className={styles.header}>
        
        <div className={styles.logoWrapper}>
          <LogoUsuarios />
        </div>
        <div className={styles.blockName}>
          <p className={styles.saludo}>
            Hola, 
          </p>
          <strong className={styles.saludoName}>Andrés</strong>
        </div>
      </div> 
  );
}