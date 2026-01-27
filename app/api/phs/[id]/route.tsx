import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL

// 🔹 OBTENER COPROPIEDAD POR ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`${BACKEND_URL}/phs/${params.id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: 'No autenticado' },
      { status: 401 }
    )
  }
}

// 🔹 ACTUALIZAR COPROPIEDAD
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const res = await fetch(`${BACKEND_URL}/phs/${params.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: 'No autenticado' },
      { status: 401 }
    )
  }
}

// 🔹 ELIMINAR COPROPIEDAD
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`${BACKEND_URL}/phs/${params.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: 'No autenticado' },
      { status: 401 }
    )
  }
}
