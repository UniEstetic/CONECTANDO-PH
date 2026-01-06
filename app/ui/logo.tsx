import Image from 'next/image';
import styles from './styles/home.module.css';

type AcmeLogoProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function AcmeLogo({ children, className }: AcmeLogoProps) {
  return (
    <div className={styles.titleHome}>
      <Image
        src="/imagenes/00_logo_conectandoph_normal.svg"
        alt="Perfil"
        width={200}
        height={200}
        priority
      />

      {children}
    </div>
  );
}
