'use client';

import styles from './ui/styles/home.module.css';
import AcmeLogo from '@/app/ui/logo';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth'

export default function Page() {

  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response = await login(email, password);
      console.log("response",response)
      return
      // Redirigir al dashboard después del login exitoso
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className={styles.mainContainer}>

      {/* Fondo Negro Curvo */}
      <div className={styles.curveSection}>
        <AcmeLogo />
      </div>

      {/* Contenido Login */}
      <div className={styles.home}>
        <div className={styles.blocksHome}>
          <p className={styles.titleHome}>
            Tu copropiedad, mejor gestionada, mejor informada y mejor conectada
          </p>
        </div>

        <p className={styles.textinputHome}>Correo electrónico</p>
        <input 
        id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                   className={styles.inputHome}
                   placeholder="andres@gmail.com" />

        <p className={styles.textinputHome}>Contraseña</p>
        <input id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} className={styles.inputHome} placeholder="********" />

        <Link href="#" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>

        <Link onClick={handleSubmit} href="/usuarios" className={styles.btnUsuarios}>
          Iniciar Sesión
        </Link>
      </div>

      {/* Footer */}
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
