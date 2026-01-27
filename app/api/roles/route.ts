import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL

// 🔹 LISTAR ROLES
export async function GET(req: Request) {
  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/roles`,
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

    const text = await backendResponse.text()
    console.log('RAW BACKEND RESPONSE:', text)

    if (!text) {
      return NextResponse.json(
        { message: 'Empty response from backend' },
        { status: backendResponse.status }
      )
    }

    const data = JSON.parse(text)

    return NextResponse.json(data, {
      status: backendResponse.status,
    })
  } catch (error) {
    console.error('PROXY ERROR 👉', error)

    return NextResponse.json(
      { message: 'No autenticado o error interno' },
      { status: 401 }
    )
  }
}

// 🔹 CREAR ROL
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const backendResponse = await fetch(
      `${BACKEND_URL}/roles`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
      }
    )

    const text = await backendResponse.text()
    console.log('RAW BACKEND RESPONSE:', text)

    if (!text) {
      return NextResponse.json(
        { message: 'Empty response from backend' },
        { status: backendResponse.status }
      )
    }

    const data = JSON.parse(text)

    return NextResponse.json(data, {
      status: backendResponse.status,
    })
  } catch (error) {
    console.error('PROXY ERROR 👉', error)

    return NextResponse.json(
      { message: 'No autenticado o error interno' },
      { status: 401 }
    )
  }
}
