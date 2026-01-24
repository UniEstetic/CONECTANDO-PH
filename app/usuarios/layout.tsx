'use client';

import UsuariosFooter from './components/UsuariosFooter';
import AuthGuard from '@/app/components/AuthGuard';

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <><>
        {children}

      </><UsuariosFooter /></>
    </AuthGuard>
  );
}
