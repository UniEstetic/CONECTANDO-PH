import Image from 'next/image';
import styles from '@/app/ui/styles/usuarios.module.css';
import Link from 'next/link';
import { ImportIcon } from 'lucide-react';
import Header from "@/app/components/general/header";
import Footer from "@/app/components/general/footer";
import LogoutPage from "@/app/auth/login/logout";

export default function UsuariosPage() {
  return (
    <div className={styles.container}>
      <LogoutPage />
      <Header/>
      <p className={styles.opcionesUsuarios}>Tus opciones</p>

      <div className={styles.roles}>
        <div className={styles.role}>
          <div className={styles.imagenUsuarios}>
            <Link href="/residentes" className={styles.btnUsuarios}>
              <Image
                src="/imagenes/01_boton residente Prop.svg"
                alt="Residente o propietario"
                width={400}
                height={200}
              />
            </Link>
          </div>
        </div>

        <div className={styles.role}>
          <div className={styles.imagenUsuarios}>
            <Link href="/admin" className={styles.btnUsuarios}>
              <Image
                src="/imagenes/02_boton administrador.svg"
                alt="Administrador o delegado"
                width={400}
                height={200}
              />
            </Link>
          </div>
        </div>

        <div className={styles.role}>
          <div className={styles.imagenUsuarios}>
            <Link href="/porteria" className={styles.btnUsuarios}>
              <Image
                src="/imagenes/03_boton personal porteria.svg"
                alt="Personal de portería"
                width={400}
                height={200}
              />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
