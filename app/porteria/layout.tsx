'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingState from '@/app/components/LoadingState';

export default function PorteriaLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    const rolesLimpios: string[] = (session?.user?.roles || []).map((r) =>
      r.toLowerCase().trim()
    );

    // ✅ Roles permitidos
    const permitidos: string[] = ['portero', 'porteria', 'administrador', 'admin'];

    const tieneAcceso = rolesLimpios.some(role =>
      permitidos.includes(role)
    );

    if (status === 'unauthenticated' || !tieneAcceso) {
      router.replace('/');
    } else {
      setAutorizado(true);
    }

  }, [status, session, router]);

  // ⛔ Evita el flash
  if (status === 'loading' || !autorizado) {
    return <LoadingState message="Cargando módulo de portería..." variant="fullPage" />;
  }

  return <>{children}</>;
}