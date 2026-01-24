export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const { id } = params;

    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/roles/${id}`,
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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const { id } = params;

    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/roles/${id}`,
      {
        method: 'DELETE',
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const { id } = params;

    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/roles/${id}`,
      {
        method: 'PUT',
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
