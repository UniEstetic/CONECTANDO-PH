// Este archivo define el endpoint /api/auth/validate en el frontend (Next.js).
// Su función es actuar como proxy para validar el token de autenticación en el backend.
//
// Flujo:
// 1. Recibe una petición POST desde el frontend con el token en el header Authorization.
// 2. Si no hay token, responde 401 (no autorizado).
// 3. Reenvía la petición al backend (/auth/validate) incluyendo el token y el body original.
// 4. Devuelve la respuesta del backend al frontend.

import { NextResponse } from 'next/server';
import type { ValidateLoginResponse } from '@/app/lib/definitions';

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

    // Asegura que el body tenga la forma { fields: { email, password } }
    const body = await req.json();
    let backendBody = body;
    // Si el body tiene email y password directos, los anida en fields
    if (body.email && body.password && !body.fields) {
      backendBody = { fields: { email: body.email, password: body.password } };
    }

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
      body: JSON.stringify(backendBody),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { message: 'Error del backend' },
        { status: res.status }
      );
    }

    // Devuelve la respuesta del backend al frontend
    const data: ValidateLoginResponse = await res.json();
    // Si el backend devuelve access_token, lo guardamos en cookie httpOnly
    const accessToken = data?.result?.access_token;
    if (accessToken) {
      const response = NextResponse.json(data, { status: res.status });
      response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
      return response;
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[AUTH/VALIDATE] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
