import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL!

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/users/email/${params.email}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // reenviamos la cookie al backend
          cookie: req.headers.get('cookie') || '',
        },
      }
    )

    const data = await backendResponse.json()
    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    return NextResponse.json(
      { message: 'No autenticado o error interno' },
      { status: 401 }
    )
  }
}
