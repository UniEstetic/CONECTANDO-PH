// Este archivo define el endpoint /api/auth/validate en el frontend (Next.js).
// Su función es actuar como proxy para validar el token de autenticación en el backend.
//
// Flujo:
// 1. Recibe una petición POST desde el frontend con el token en el header Authorization.
// 2. Si no hay token, responde 401 (no autorizado).
// 3. Reenvía la petición al backend (/auth/validate) incluyendo el token y el body original.
// 4. Devuelve la respuesta del backend al frontend.

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Obtiene el header Authorization del request (token JWT)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      // Si no hay token, responde 401
      return NextResponse.json(
        { message: 'Token requerido' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Obtiene la URL del backend desde variables de entorno
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: 'URL del backend no configurada' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/auth/validate`;

    // Reenvía la petición al backend, incluyendo el token y el body
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { message: 'Error del backend' },
        { status: res.status }
      );
    }

    // Devuelve la respuesta del backend al frontend
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[AUTH/VALIDATE] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
