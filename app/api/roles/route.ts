export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');

    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/roles`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
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
      { message: 'Internal proxy error', error },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
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
      { message: 'Internal proxy error', error },
      { status: 500 }
    );
  }
}
