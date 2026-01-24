import { NextResponse } from 'next/server';

// Credenciales internas del cliente
    const clientId = process.env.AUTH_CLIENT_ID;
    const clientSecret = process.env.AUTH_CLIENT_SECRET;
        // URL del backend
    const backendUrl = process.env.BACKEND_API_URL;

export async function POST(req: Request) {
  try {
    // Lee el body enviado desde el frontend
    const body = await req.json();

    

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { message: 'Credenciales no configuradas' },
        { status: 500 }
      );
    }

    if (!backendUrl) {
      return NextResponse.json(
        { message: 'Backend no configurado' },
        { status: 500 }
      );
    }

    // Endpoint real del backend
    const url = `${backendUrl}/auth/select`;

    // Reenvía la petición al backend
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': clientId,
        'client-secret': clientSecret,
      },
      body: JSON.stringify(body),
    });

    // Manejo de error del backend
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: res.status });
    }

    // Devuelve la respuesta al frontend
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error('Error de conexion', error);
    return NextResponse.json(
      { message: 'Error interno' },
      { status: 500 }
    );
  }
}
