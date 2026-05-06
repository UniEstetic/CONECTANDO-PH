'use client';

import React, { useMemo } from 'react';
import styles from '@/app/ui/styles/usuarios.module.css';

interface AccessProps {
  rolesUsuario: string[];
  permisosRequeridos: string[];
  children: React.ReactNode;
}

/**
 * Envuelve cualquier componente (botón, sección, etc.)
 * Si el usuario no tiene permisos:
 * - Aplica estilo visual (.noAcceso)
 * - Bloquea interacción (CSS)
 * - No rompe el layout
 */
export const AccessGuard = ({
  rolesUsuario,
  permisosRequeridos,
  children
}: AccessProps) => {

  // 🔹 Normaliza y valida roles (optimizado)
  const tieneAcceso = useMemo(() => {
    if (!rolesUsuario || rolesUsuario.length === 0) return false;

    const rolesLimpios = rolesUsuario.map(r =>
      r.toLowerCase().trim()
    );

    return permisosRequeridos.some(p =>
      rolesLimpios.includes(p.toLowerCase().trim())
    );
  }, [rolesUsuario, permisosRequeridos]);

  return (
    <div
      className={`${styles.guardContainer} ${!tieneAcceso ? styles.noAcceso : ''}`}
      title={!tieneAcceso ? 'No tienes permisos' : undefined}
    >
      {children}
    </div>
  );
};