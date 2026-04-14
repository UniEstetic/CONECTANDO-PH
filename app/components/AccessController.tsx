import React from 'react';
import styles from '@/app/ui/styles/usuarios.module.css';

interface AccessProps {
  rolesUsuario: string[];  // Los roles que tiene el usuario logueado
  permisosRequeridos: string[]; // Los roles permitidos para este contenido
  children: React.ReactNode;
}

/**
 * Este componente envuelve cualquier botón o sección.
 * Si el usuario no tiene el rol, "apaga" el contenido sin mover el diseño.
 */
export const AccessGuard = ({ rolesUsuario, permisosRequeridos, children }: AccessProps) => {
  // Limpiamos los roles del usuario (user tiene "Residentes")
  const rolesLimpios = rolesUsuario.map(r => r.toLowerCase().trim());
  
  // Verificamos si alguno de los permisos requeridos coincide con los del usuario
  const tieneAcceso = permisosRequeridos.some(p => 
    rolesLimpios.includes(p.toLowerCase().trim())
  );

  return (
    <div className={`${styles.guardContainer} ${!tieneAcceso ? styles.noAcceso : ''}`}>
      {children}
    </div>
  );
};