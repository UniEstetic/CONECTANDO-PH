'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// ✅ Tipado correcto
interface Role {
  id: string;
  name: string;
}

export default function PorteriaLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    // ✅ Obtener roles correctamente
    const roles: Role[] = (session?.user as any)?.userProfile?.roles || [];

    // ✅ Normalizar
    const rolesLimpios: string[] = roles.map(r =>
      r.name.toLowerCase().trim()
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
    return <p>Cargando módulo de portería...</p>;
  }

  return <>{children}</>;
}