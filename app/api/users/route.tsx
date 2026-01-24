import { NextResponse } from 'next/server';

const BACKEND_URL = `${process.env.BACKEND_API_URL}/users`;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');

  const res = await fetch(BACKEND_URL, {
    headers: {
      Authorization: auth ?? '',
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
