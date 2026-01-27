import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await req.json();
    const { userId } = params;

    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/user_roles/assing/${userId}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // reenviamos la cookie al backend
          cookie: req.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
      }
    );

    const text = await backendResponse.text();
    console.log('RAW BACKEND RESPONSE:', text);

    if (!text) {
      return NextResponse.json(
        { message: 'Empty response from backend' },
        { status: backendResponse.status }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('PROXY ERROR 👉', error);

    return NextResponse.json(
      { message: 'Internal proxy error' },
      { status: 500 }
    );
  }
}
