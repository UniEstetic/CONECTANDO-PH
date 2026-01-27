import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL

export async function GET(req: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/phs`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // reenviamos la cookie al backend
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

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const res = await fetch(`${BACKEND_URL}/phs`, {
      method: 'POST',
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
