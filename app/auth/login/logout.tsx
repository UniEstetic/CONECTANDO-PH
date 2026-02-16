import { handleSignOut } from "@/app/actions/auth";
import styles from "@/app/ui/styles/headerUsuarios.module.css"

export default function LogoutPage() {
  return (
    <form className={styles.logogut} action={handleSignOut}>
      <button className={styles.logogutButton} type="submit">
        Cerrar Sesión
      </button>
    </form>
  );
}