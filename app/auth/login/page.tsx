"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

import styles from '@/app/ui/styles/home.module.css';
import AcmeLogo from '@/app/ui/logo';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const resolveAuthErrorMessage = (result: unknown) => {
    const payload = (result || {}) as { error?: string; code?: string };
    if (!payload.error) return null;

    if (payload.error === 'CredentialsSignin') {
      return payload.code && payload.code !== 'credentials'
        ? payload.code
        : 'Email o contrasena incorrectos';
    }

    return payload.error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    const authError = resolveAuthErrorMessage(result);
    if (authError) {
      setError(authError || "Email o contrasena incorrectos");
      setLoading(false);
      setTimeout(() => setError(null), 3000)
    } else {
      // Si todo sale bien, redirigimos manualmente
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.curveSection}>
        <AcmeLogo />
      </div>

      <form onSubmit={handleSubmit} className={styles.home}>
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
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button className={styles.btnUsuarios} type="submit">
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>

      </form>

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