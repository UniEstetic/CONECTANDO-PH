import { NextRequest, NextResponse } from "next/server";

const URL_BACKEND = process.env.BACKEND_API_URL ?? "http://localhost:3001/api/v1";
const CLIENT_ID = process.env.AUTH_CLIENT_ID;
const SECRET_ID = process.env.AUTH_CLIENT_SECRET;

export async function POST(req: NextRequest) {
  if (!CLIENT_ID || !SECRET_ID) {
    return NextResponse.json(
      { message: "Falta configuración del cliente API" },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();

    if (!body.token || !body.password || !body.confirm_password) {
      return NextResponse.json(
        { message: "Token, contraseña y confirmación son requeridos" },
        { status: 400 },
      );
    }

    console.log('[set-password] Enviando:', { token: body.token?.substring(0, 20) + '...', password: '***', confirm_password: '***' });
    console.log('[set-password] URL:', `${URL_BACKEND}/auth/set-password`);

    const res = await fetch(`${URL_BACKEND}/auth/set-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "client-id": CLIENT_ID,
        "client-secret": SECRET_ID,
      },
      body: JSON.stringify({
        token: body.token,
        password: body.password,
        confirm_password: body.confirm_password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    console.log('[set-password] Status:', res.status);
    console.log('[set-password] Respuesta:', data);

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || `Error del servidor (${res.status})` },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "No se pudo completar la solicitud. Intenta nuevamente." },
      { status: 500 },
    );
  }
}
