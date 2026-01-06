import Link from 'next/link';
import Image from 'next/image';
import styles from '../../ui/styles/footer.module.css';

export default function UsuariosFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.containerFooter}>
        <Link href="/usuarios" className={styles.item_home}>
        <Image
          src="/imagenes/10_boton inicio.svg"
          alt="Inicio"
          width={30}
          height={10}
        />
      </Link>

      <Link href="/usuarios/notificaciones" className={styles.item}>
        <Image
          src="/imagenes/11_boton notificaciones.svg"
          alt="Notificaciones"
          width={47}
          height={10}
        />
      </Link>

      <Link href="/usuarios/whatsapp" className={styles.item}>
        <Image
          src="/imagenes/12_boton whatsapp.svg"
          alt="whatsapp"
          width={35}
          height={10}
        />
      </Link>

      <Link href="/usuarios/ayuda" className={styles.item}>
        
        <Image
          src="/imagenes/13_boton ayuda.svg"
          alt="Ayuda"
          width={27}
          height={10}
        />
      </Link>

      <Link href="/" className={styles.item}>
        
        <Image
          src="/imagenes/14_perfil.svg"
          alt="Perfil"
          width={27}
          height={10}
        />
      </Link>
      
      </div>
    </footer>
  );
}
