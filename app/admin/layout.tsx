'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const rolesLimpios = (session?.user?.roles || []).map((r) => r.toLowerCase().trim());

    // ✅ Validar acceso
    const esAdmin =
      rolesLimpios.includes('administrador') ||
      rolesLimpios.includes('admin');

    if (status === 'unauthenticated' || !esAdmin) {
      router.replace('/');
    }

  }, [status, session, router]);

  if (status === 'loading') return <p>Validando acceso de Administrador...</p>;

  return <>{children}</>;
}