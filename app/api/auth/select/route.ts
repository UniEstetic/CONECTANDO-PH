// Este archivo define el endpoint /api/auth/select en el frontend (Next.js).
// Su función es actuar como proxy para seleccionar o autenticar un usuario en el backend.
//
// Flujo:
// 1. Recibe una petición POST desde el frontend con los datos de autenticación.
// 2. Toma las credenciales del cliente (client-id y client-secret) de las variables de entorno.
// 3. Reenvía la petición al backend (/auth/select) incluyendo las credenciales y el body original.
// 4. Devuelve la respuesta del backend al frontend.

import { NextResponse } from 'next/server';
import type { SelectProviderResponse } from '@/app/lib/definitions';
    // Obtiene las credenciales del cliente desde variables de entorno
    const clientId = process.env.AUTH_CLIENT_ID;
    const clientSecret = process.env.AUTH_CLIENT_SECRET;
    const backendUrl = process.env.BACKEND_API_URL;

export async function POST(req: Request) {
  try {
    const body: { providerName: string } = await req.json();

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { message: 'Credenciales del cliente no configuradas' },
        { status: 500 }
      );
    }
   
    if (!backendUrl) {
      return NextResponse.json(
        { message: 'URL del backend no configurada' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/auth/select`;

    // Reenvía la petición al backend, incluyendo las credenciales y el body
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': clientId,
        'client-secret': clientSecret,
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
    const data: SelectProviderResponse = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[AUTH/SELECT] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
