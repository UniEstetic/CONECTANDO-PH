import { NextResponse } from 'next/server'

const BACKEND_URL = `${process.env.BACKEND_API_URL}/users/register`

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const backendResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // reenviamos la cookie al backend
        cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await backendResponse.json()
    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creando usuario' },
      { status: 500 }
    )
  }
}
