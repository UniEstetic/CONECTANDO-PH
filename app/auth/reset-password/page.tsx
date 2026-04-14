"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import styles from "@/app/ui/styles/home.module.css";
import rpStyles from "@/app/ui/styles/resetPassword.module.css";
import AcmeLogo from "@/app/ui/logo";
import ToastNotice from "@/app/components/general/ToastNotice";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Request reset state
  const [email, setEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // Set password state
  const [password, setPassword_] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSet, setPasswordSet] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Ingresa tu correo electrónico" });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al solicitar recuperación");
      setRequestSent(true);
      setMessage({
        type: "success",
        text: "Te hemos enviado un correo con el enlace de recuperación",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al solicitar recuperación";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al establecer la contraseña");
      setPasswordSet(true);
      setMessage({
        type: "success",
        text: "Tu contraseña ha sido actualizada correctamente",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Error al establecer la contraseña";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // ---------- SET PASSWORD VIEW (token present) ----------
  if (token) {
    if (passwordSet) {
      return (
        <main className={styles.mainContainer}>
          <ToastNotice
            message={message}
            onClear={() => setMessage(null)}
            durationMs={8000}
          />
          <div className={styles.curveSection}>
            <AcmeLogo />
          </div>
          <div className={`${styles.home} ${rpStyles.content}`}>
            <div className={rpStyles.successBox}>
              <div className={rpStyles.iconCircle}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="#AB8B48"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="10" stroke="#AB8B48" strokeWidth="2" />
                </svg>
              </div>
              <p className={rpStyles.successTitle}>
                ¡Contraseña actualizada!
              </p>
              <p className={rpStyles.successText}>
                Tu contraseña ha sido restablecida exitosamente. Ya puedes
                iniciar sesión con tu nueva contraseña.
              </p>
              <Link href="/auth/login" className={`${styles.btnUsuarios} ${rpStyles.btn}`}>
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className={styles.mainContainer}>
        <ToastNotice
          message={message}
          onClear={() => setMessage(null)}
          durationMs={5000}
        />
        <div className={styles.curveSection}>
          <AcmeLogo />
        </div>
        <form onSubmit={handleSetPassword} className={`${styles.home} ${rpStyles.content}`}>
          <div className={rpStyles.headerGroup}>
            <p className={rpStyles.heading}>Configura tu contraseña</p>
            <p className={rpStyles.subheading}>
              Crea una contraseña segura para acceder a tu cuenta
            </p>
          </div>

          <p className={styles.textinputHome}>Nueva contraseña</p>
          <input
            className={styles.inputHome}
            type="password"
            value={password}
            onChange={(e) => setPassword_(e.target.value)}
            placeholder="••••••••"
          />

          <p className={styles.textinputHome}>Confirmar contraseña</p>
          <input
            className={styles.inputHome}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button className={`${styles.btnUsuarios} ${rpStyles.btn}`} type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Establecer contraseña"}
          </button>

          <Link href="/auth/login" className={rpStyles.backLink}>
            Volver al inicio de sesión
          </Link>
        </form>
      </main>
    );
  }

  // ---------- REQUEST RESET VIEW (no token) ----------
  if (requestSent) {
    return (
      <main className={styles.mainContainer}>
        <ToastNotice
          message={message}
          onClear={() => setMessage(null)}
          durationMs={8000}
        />
        <div className={styles.curveSection}>
          <AcmeLogo />
        </div>
        <div className={`${styles.home} ${rpStyles.content}`}>
          <div className={rpStyles.successBox}>
            <div className={rpStyles.iconCircle}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8l9 6 9-6"
                  stroke="#AB8B48"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="#AB8B48"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p className={rpStyles.successTitle}>Revisa tu correo</p>
            <p className={rpStyles.successText}>
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <button
              className={rpStyles.resendBtn}
              onClick={() => {
                setRequestSent(false);
                setMessage(null);
              }}
            >
              ¿No lo recibiste? Reenviar
            </button>
            <Link href="/auth/login" className={rpStyles.backLink}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <ToastNotice
        message={message}
        onClear={() => setMessage(null)}
        durationMs={5000}
      />
      <div className={styles.curveSection}>
        <AcmeLogo />
      </div>
      <form onSubmit={handleRequestReset} className={`${styles.home} ${rpStyles.content}`}>
        <p className={rpStyles.heading}>¿Olvidaste tu contraseña?</p>
        <p className={rpStyles.subheading}>
          Ingresa tu correo y te enviaremos un enlace para restablecerla
        </p>

        <p className={styles.textinputHome}>Correo electrónico</p>
        <input
          className={styles.inputHome}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="andres@gmail.com"
        />

        <button className={`${styles.btnUsuarios} ${rpStyles.btn}`} type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        <Link href="/auth/login" className={rpStyles.backLink}>
          Volver al inicio de sesión
        </Link>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
