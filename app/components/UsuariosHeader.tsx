"use client";

import styles from '@/app/ui/styles/headerUsuarios.module.css'
import LogoUsuarios from '@/app/components/logo_usuarios'
import LogoutPage from "@/app/auth/login/logout";
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function UsuariosHeader() {
  const { data: session } = useSession()
  const user = (session?.user as any) || {}
  const profile = user?.userProfile || {}
    const pathname = usePathname()

  const firstName =
    user?.firstName || 'Usuario';

     // 👉 SOLO mostrar en la pantalla principal
  const isMain = pathname === "/";

  return (
    <div className={styles.headerUsuariosPropiedad}>
      {isMain && <LogoutPage/> }

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
