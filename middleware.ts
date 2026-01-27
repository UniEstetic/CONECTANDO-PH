import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/', req.url))
    res.cookies.delete('access_token')
    return res
  }
}

export const config = {
  matcher: ['/usuarios/:path*', '/test-conexion', '/admin/:path*'],
}
