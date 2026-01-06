import styles from './ui/styles/home.module.css';
import AcmeLogo from '@/app/ui/logo';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  return (
    <main className={styles.mainContainer}>

      {/* Fondo Negro Curvo */}
      <div className={styles.curveSection}>
        <AcmeLogo />
      </div>

      {/* Contenido Login */}
      <div className={styles.home}>
        <div className={styles.blocksHome}>
          <p className={styles.titleHome}>
            Tu copropiedad, mejor gestionada, mejor informada y mejor conectada
          </p>
        </div>

        <p className={styles.textinputHome}>Correo electrónico</p>
        <input className={styles.inputHome} type="text" placeholder="andres@gmail.com" />

        <p className={styles.textinputHome}>Contraseña</p>
        <input className={styles.inputHome} type="password" placeholder="********" />

        <Link href="#" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>

        <Link href="/usuarios" className={styles.btnUsuarios}>
          Iniciar Sesión
        </Link>
      </div>

      {/* Footer */}
      <footer className={styles.footerHomeLogin}>
        <p className={styles.textFooter}>¿Cambiaste tu cel?</p>
        <Link href="/usuarios/ayuda" className={styles.item}>
          <Image
            src="/imagenes/13_boton ayuda.svg"
            alt="Ayuda"
            width={27}
            height={10}
            priority
          />
        </Link>
      </footer>
    </main>
  );
}
