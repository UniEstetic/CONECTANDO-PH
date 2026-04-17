'use client';
import styles from '@/app/ui/styles/usuarios.module.css';

import LogoUsuarios from '@/app/components/logo_usuarios';
import LogoutPage from "@/app/auth/login/logout";
import { useSession } from "next-auth/react";
import { HeaderPropertySelector } from '@/app/components/HeaderPropertySelector';

export default function Header() {
  const { data: session } = useSession();
  const firstName = session?.user?.userProfile?.firstName || 'Usuario';

  return (
    <div className={styles.header}>
        <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-end', paddingRight: '5.5rem' }}>
          <LogoutPage />
        </div>
        
        <div className={styles.logoWrapper}>
          <LogoUsuarios />
        </div>
        <div className={styles.blockName}>
          <p className={styles.saludo}>
            Hola, 
          </p>
          <strong className={styles.saludoName}>{firstName}</strong>
        </div>
        
        {/* Property Selector in Header */}
        <div className="mt-3">
          <HeaderPropertySelector />
        </div>
      </div> 
  );
}