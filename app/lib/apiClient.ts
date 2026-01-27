// Es una función centralizada para hacer todas las peticiones HTTP a la API.
export async function apiClient(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // Incluir cookies automáticamente
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  return res;
}
