'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ✅ Tipado de roles
interface Role {
  id: string;
  name: string;
}

export default function ResidentesLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // ✅ Obtener roles correctamente tipados
    const roles: Role[] = (session?.user as any)?.userProfile?.roles || [];

    // ✅ Normalizar a string[]
    const rolesLimpios: string[] = roles.map(r =>
      r.name.toLowerCase().trim()
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

  if (status === 'loading') return <p>Cargando módulo de residentes...</p>;

  return <>{children}</>;
}