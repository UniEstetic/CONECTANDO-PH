import { NextRequest, NextResponse } from "next/server";

const URL_BACKEND = process.env.BACKEND_API_URL;
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

    if (!body.email) {
      return NextResponse.json(
        { message: "El correo es requerido" },
        { status: 400 },
      );
    }

    const res = await fetch(`${URL_BACKEND}/auth/reset-password-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "client-id": CLIENT_ID,
        "client-secret": SECRET_ID,
      },
      body: JSON.stringify({ email: body.email }),
    });

    const data = await res.json().catch(() => ({}));

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
