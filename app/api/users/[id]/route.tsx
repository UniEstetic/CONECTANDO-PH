import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const token = req.headers.get('authorization');

  const res = await fetch(`${BACKEND_URL}/users/id/${id}`, {
    headers: {
      Authorization: token || '',
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await req.json();
  const token = req.headers.get('authorization');

  const res = await fetch(`${BACKEND_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const token = req.headers.get('authorization');

  const res = await fetch(`${BACKEND_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: token || '',
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
