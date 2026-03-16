"use client";

import styles from '@/app/ui/styles/headerUsuarios.module.css'
import LogoUsuarios from '@/app/components/logo_usuarios'
import LogoutPage from "@/app/auth/login/logout";
import { useSession } from 'next-auth/react'

export default function UsuariosHeader() {
  const { data: session } = useSession()
  const user = (session?.user as any) || {}
  const profile = user?.userProfile || {}

  const firstName =
    user?.firstName || 'Usuario';

  return (
    <div className={styles.headerUsuariosPropiedad}>
      <LogoutPage/>

      <LogoUsuarios />

      <div className={styles.blockName}>
          <p className={styles.saludo}>
            Hola, 
          </p>
          <strong className={styles.saludoName}>{firstName}</strong>
      </div>
    </div>
  )
}
