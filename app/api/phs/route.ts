// Este archivo define el endpoint /api/phs en el frontend (Next.js).
// Su función es actuar como proxy para listar y crear copropiedades (phs) en el backend.
//
// Flujo:
// - GET: Lista todas las copropiedades, reenviando el token de autenticación al backend.
// - POST: Crea una nueva copropiedad, reenviando el token y el body al backend.
//
// Si no hay token, responde 401 (no autorizado).

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

// 🔹 LISTAR COPROPIEDADES
export async function GET(req: Request) {
  // Obtiene el header Authorization del request (token JWT)
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    // Si no hay token, responde 401
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    );
  }

  // Reenvía la petición al backend, incluyendo el token
  const res = await fetch(`${BACKEND_URL}/phs`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
  });

  // Devuelve la respuesta del backend al frontend
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 🔹 CREAR COPROPIEDAD
export async function POST(req: Request) {
  const body = await req.json();
  // Obtiene el header Authorization del request (token JWT)
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    // Si no hay token, responde 401
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    );
  }

  // Reenvía la petición al backend, incluyendo el token y el body
  const res = await fetch(`${BACKEND_URL}/phs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  // Devuelve la respuesta del backend al frontend
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
