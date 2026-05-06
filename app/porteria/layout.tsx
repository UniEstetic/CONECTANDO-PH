'use client';

import RoleLayout from '@/app/components/RoleLayout';

export default function PorteriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout
      allowedRoles={['portero', 'porteria', 'admin', 'administrador']}
      message="Cargando módulo de portería..."
    >
      {children}
    </RoleLayout>
  );
}