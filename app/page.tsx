'use client';

import { useState } from 'react';
import styles from './ui/styles/home.module.css';
import AcmeLogo from '@/app/ui/logo';
import Link from 'next/link';
import Image from 'next/image';
import { selectProvider, validateLogin } from './lib/auth.service';
import { useRouter } from 'next/navigation';
 

// Componente principal de la página (Next.js / React)
export default function Page() {

  // Estado para guardar el email, contraseña que escribe el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Hook de Next.js para redireccionar entre páginas
  const router = useRouter();

  // Función que se ejecuta cuando el usuario hace click en "Iniciar sesión"
  const handleLogin = async () => {
    try {
      // Selecciona el proveedor de autenticación
      const selectResponse = await selectProvider('accessEmail');
      // Se obtiene el token temporal que devuelve el backend solo es para validar el token
      const tempToken = selectResponse.result.authorization.token;

      // Se valida el login enviando:
      // - Token temporal
      // - Email
      // - Contraseña
      const validateResponse = await validateLogin(
        tempToken,
        email,
        password
      );

      // Se guarda en cookie httpOnly
      // Redirección a una ruta protegida después del login exitoso
      router.push('/test-conexion');

    } catch (error) {
      // Si ocurre cualquier error durante el proceso de login
      alert('Credenciales incorrectas. Intenta de nuevo.');
    }
  };
}


  return (
    <main className={styles.mainContainer}>
      <div className={styles.curveSection}>
        <AcmeLogo />
      </div>

      <div className={styles.home}>
        <div className={styles.blocksHome}>
          <p className={styles.titleHome}>
            Tu copropiedad, mejor gestionada, mejor informada y mejor conectada
          </p>
        </div>

        <p className={styles.textinputHome}>Correo electrónico</p>
        <input
          className={styles.inputHome}
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="andres@gmail.com"
        />

        <p className={styles.textinputHome}>Contraseña</p>
        <input
          className={styles.inputHome}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
        />

        <Link href="#" className={styles.forgot}>
          ¿Olvidaste tu contraseña?
        </Link>

        <button className={styles.btnUsuarios} onClick={handleLogin}>
          Iniciar Sesión
        </button>
      </div>

      <footer className={styles.footerHomeLogin}>
        <p className={styles.textFooter}>¿Cambiaste tu cel?</p>
        <Link href="/usuarios/ayuda" className={styles.item}>
          <Image
            src="/imagenes/13_boton ayuda.svg"
            alt="Ayuda"
            width={27}
            height={10}
            priority
          />
        </Link>
      </footer>
    </main>
  );
}
