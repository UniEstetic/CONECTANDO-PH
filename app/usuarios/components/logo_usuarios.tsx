import Image from 'next/image';
import styles from '../../ui/styles/home.module.css';

type LogoUsuariosProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function LogoUsuarios({ children, className }: LogoUsuariosProps) {
  return (
    <div className={styles.titleHome}>
      <Image
        src="/imagenes/00_logo_conectandoph_horiz.svg"
        alt="Conectando P.H"
        width={200}
        height={200}
        priority
      />

      {children}
    </div>
  );
}
