import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

// 🔹 OBTENER COPROPIEDAD POR ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    );
  }

  const res = await fetch(`${BACKEND_URL}/phs/${params.id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 🔹 ACTUALIZAR COPROPIEDAD
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    );
  }

  const res = await fetch(`${BACKEND_URL}/phs/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 🔹 ELIMINAR COPROPIEDAD
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    );
  }

  const res = await fetch(`${BACKEND_URL}/phs/${params.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
