'use client'

import { signOut } from 'next-auth/react'
import styles from "@/app/ui/styles/headerUsuarios.module.css"

export default function LogoutPage() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <form
      className={styles.logogut}
      onSubmit={(e) => {
        e.preventDefault()
        void handleSignOut()
      }}
    >
      <button className={styles.logogutButton} type="submit">
        Cerrar Sesión
      </button>
    </form>
  );
}