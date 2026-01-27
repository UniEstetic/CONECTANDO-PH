import { NextResponse } from 'next/server'

const BACKEND_URL = `${process.env.BACKEND_API_URL}/users`

export async function GET(req: Request) {
  const res = await fetch(BACKEND_URL, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // reenviar cookies
      cookie: req.headers.get('cookie') || '',
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
