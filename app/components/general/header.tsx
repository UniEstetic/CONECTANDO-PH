'use client';
import styles from '@/app/ui/styles/usuarios.module.css';

import LogoUsuarios from '@/app/components/logo_usuarios';
import LogoutPage from "@/app/auth/login/logout";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const firstName = session?.user?.userProfile?.firstName || 'Usuario';

  return (
    <div className={styles.header}>
        
        <div className={styles.logoWrapper}>
          <LogoUsuarios />
        </div>
        <div className={styles.blockName}>
          <p className={styles.saludo}>
            Hola, 
          </p>
          <strong className={styles.saludoName}>{firstName}</strong>
        </div>
      </div> 
  );
}