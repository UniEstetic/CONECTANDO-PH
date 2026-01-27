import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL!

// 🔹 OBTENER USUARIO POR ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/users/id/${params.id}`,
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

// 🔹 ACTUALIZAR USUARIO
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const backendResponse = await fetch(
      `${BACKEND_URL}/users/${params.id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
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

// 🔹 ELIMINAR USUARIO
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/users/${params.id}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
