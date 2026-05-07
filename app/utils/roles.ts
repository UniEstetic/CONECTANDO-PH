export interface Role {
  id: string;
  name: string;
}

export interface SessionUser {
  userProfile?: {
    roles?: Role[];
  };
}

// 🔹 Normaliza roles
export const normalizeRole = (role: string): string =>
  role.toLowerCase().trim();

// 🔹 Obtiene roles del usuario
export const getUserRoles = (session: any): string[] => {
  const roles: Role[] =
    (session?.user as SessionUser)?.userProfile?.roles || [];

  return roles.map((r) => normalizeRole(r.name));
};

// 🔹 Verifica si tiene al menos un rol permitido
export const hasRole = (
  session: any,
  allowedRoles: string[]
): boolean => {
  const userRoles = getUserRoles(session);

  return userRoles.some((role) =>
    allowedRoles.includes(role)
  );
};
