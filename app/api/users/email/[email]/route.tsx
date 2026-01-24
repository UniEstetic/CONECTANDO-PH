import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  const token = req.headers.get('authorization');

  const res = await fetch(
    `${BACKEND_URL}/users/email/${params.email}`,
    {
      headers: {
        Authorization: token || '',
      },
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
