'use client'
import { usePathname } from 'next/navigation' 
import { signOut } from 'next-auth/react'
import styles from "@/app/ui/styles/headerUsuarios.module.css"

export default function LogoutPage() {
  const pathname = usePathname()
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }
  const esVistaPrincipal = pathname === '/'

  if (!esVistaPrincipal) {
    return null
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