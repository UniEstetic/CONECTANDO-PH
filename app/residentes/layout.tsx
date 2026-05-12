'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingState from '@/app/components/LoadingState';

export default function ResidentesLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const rolesLimpios: string[] = (session?.user?.roles || []).map((r) =>
      r.toLowerCase().trim()
    );

    // ✅ Roles permitidos
    const permitidos: string[] = ['residentes', 'residente', 'administrador', 'admin'];

    // ✅ Validación sin error de TypeScript
    const tieneAcceso = rolesLimpios.some(role =>
      permitidos.includes(role)
    );

    if (status === 'unauthenticated' || !tieneAcceso) {
      router.replace('/');
    }

  }, [status, session, router]);

  if (status === 'loading') return <LoadingState message="Cargando módulo de residentes..." variant="fullPage" />;

  return <>{children}</>;
}