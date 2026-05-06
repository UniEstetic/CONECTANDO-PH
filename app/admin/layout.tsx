'use client';

import RoleLayout from '@/app/components/RoleLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout
      allowedRoles={['admin', 'administrador']}
      message="Validando acceso de Administrador..."
    >
      {children}
    </RoleLayout>
  );
}
