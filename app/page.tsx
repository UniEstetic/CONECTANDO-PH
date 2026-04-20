import Image from 'next/image';
import styles from '@/app/ui/styles/usuarios.module.css';
import Link from 'next/link';
import { ImportIcon } from 'lucide-react';
import { AccessGuard } from "@/app/components/AccessController";
import Header from "@/app/components/general/header";
import Footer from "@/app/components/general/footer";
import LogoutPage from "@/app/auth/login/logout";
import { auth } from "@/app/api/auth/[...nextauth]/auth.config";


export default async function UsuariosPage() {
  // 1. Obtenemos la sesión para conocer los roles del usuario
  const session = await auth();
  const userRoles = session?.user?.userProfile?.roles?.map((r: any) => r.name) || [];
  return (
    <div className={styles.container}>
      <LogoutPage />
      <Header/>
      <p className={styles.opcionesUsuarios}>Tus opciones</p>

      <div className={styles.roles}>
        {/* BOTÓN RESIDENTE: Permitido para Residentes y Administradores */}
        <AccessGuard rolesUsuario={userRoles} permisosRequeridos={['Residentes', 'Administrador']}>
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
    </AccessGuard>

    {/* BOTÓN ADMINISTRADOR */}
      <AccessGuard rolesUsuario={userRoles} permisosRequeridos={['Administrador', 'admin']}>
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
      </AccessGuard>

      {/* BOTÓN PORTERÍA */}<AccessGuard rolesUsuario={userRoles} permisosRequeridos={['Portero', 'administrador', 'admin']}>
      
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
        </AccessGuard>
      </div>
      <Footer />
    </div>
  );
}
