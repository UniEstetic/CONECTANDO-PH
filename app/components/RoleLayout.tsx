'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import LoadingState from '@/app/components/LoadingState';
import { hasRole } from '@/app/utils/roles';

type RoleLayoutProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  message?: string;
  redirectTo?: string;
};

export default function RoleLayout({
  children,
  allowedRoles,
  message = 'Validando acceso...',
  redirectTo = '/'
}: RoleLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const autorizado = useMemo(
    () => hasRole(session, allowedRoles),
    [session, allowedRoles]
  );

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !autorizado) {
      router.replace(redirectTo);
    }
  }, [status, autorizado, router, redirectTo]);

  if (status === 'loading') {
    return (
      <LoadingState
        message={message}
        variant="fullPage"
      />
    );
  }

  if (!autorizado) {
  return (
    <LoadingState
      message="Redirigiendo..."
      variant="fullPage"
    />
  );
}

  return <>{children}</>;
}
