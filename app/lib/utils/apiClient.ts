import { auth } from "@/app/api/auth/[...nextauth]/auth.config";
const URL_BACKEND= process?.env?.BACKEND_API_URL ?? "http://localhost:3001/api/v1";
const CLIENT_ID= process?.env?.AUTH_CLIENT_ID ?? "cliente";
const SECRET_ID= process?.env?.AUTH_CLIENT_SECRET ?? "secreto12345";

// Es una función centralizada para hacer todas las peticiones HTTP a la API.
export async function apiClient(
  url: string,
  options: RequestInit = {}
) { 
  const res = await fetch(`${URL_BACKEND}${url}`, {
    ...options,
    credentials: 'include', // Incluir cookies automáticamente
    headers: {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
      'client-secret': SECRET_ID,
      ...(options.headers || {}),
    },
  })
  
  return res;
}

// Es una función centralizada para hacer todas las peticiones HTTP a la API.
export async function apiClientSession(
  url: string,
  options: RequestInit = {}
) { 

  const session = await auth();
  const token = session?.accessToken;
  
  const res = await fetch(`${URL_BACKEND}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
  
  return res;
}