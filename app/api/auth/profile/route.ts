// Este archivo define el endpoint /api/auth/profile en el frontend (Next.js).
// Su función es actuar como proxy para obtener el perfil del usuario autenticado desde el backend.
//
// Flujo:
// 1. Recibe una petición GET desde el frontend.
// 2. Toma el header Authorization (token JWT) del request.
// 3. Si no hay token, responde 401 (no autorizado).
// 4. Si hay token, reenvía la petición al backend (/auth/profile) con el mismo token.
// 5. Devuelve la respuesta del backend al frontend.


import { NextResponse } from 'next/server';
import { User } from '@/app/lib/definitions';

export async function GET(req: Request) {
  // Obtiene el header Authorization del request (token JWT)
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    // Si no hay token, responde 401
    return NextResponse.json(
      { message: 'Token requerido' },
      { status: 401 }
    );
  }

  // Reenvía la petición al backend, incluyendo el token
  const res = await fetch(
    `${process.env.BACKEND_API_URL}/auth/profile`,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    }
  );

  // Devuelve la respuesta del backend al frontend, tipificando como User
  const data: User = await res.json();
  return NextResponse.json(data, { status: res.status });
}
