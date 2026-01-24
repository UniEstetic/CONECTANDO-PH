export async function apiClient(
  url: string,
  options: RequestInit = {}
) {
  // Obtiene el token de autenticación si existe
  // Concatenar la url base

  const token = localStorage.getItem('access_token');
  const baseUrl = process.env.BACKEND_API_URL || '';
// if para validar el token---
  // Ejecuta la petición HTTP al backend
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Agrega el token automáticamente si está disponible
      ...(token && { Authorization: `Bearer ${token}` }),
      // Permite sobrescribir o agregar headers adicionales
      ...options.headers,
    },
  });

  // Manejo global de sesión expirada o token inválido
  if (res.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  // Retorna la respuesta para que el service la procese
  return res;
}
