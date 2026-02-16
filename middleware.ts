import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

import { auth } from "@/app/api/auth/[...nextauth]/auth.config";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Definir qué rutas son de autenticación (donde no quieres que esté si ya entró)
  const isAuthRoute = nextUrl.pathname.startsWith("/auth/login");
  
  // 2. Permitir siempre las rutas de la API de Auth
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return NextResponse.next();

  // 3. Si es una ruta de login y ya está logueado, mandarlo al dashboard/home
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 4. Si NO está logueado y NO está en login, mandarlo a login
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  //matcher: ['/usuarios/:path*', '/test-conexion', '/admin/:path*'],
  matcher: ["/((?!api|_next/static|_next/image|imagenes|favicon.ico).*)"],
}
