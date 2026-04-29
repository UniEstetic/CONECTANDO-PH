'use client';

import RoleLayout from '@/app/components/RoleLayout';

export default function ResidentesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout
      allowedRoles={['residente', 'residentes', 'admin', 'administrador']}
      message="Cargando módulo de residentes..."
    >
      {children}
    </RoleLayout>
  );
}