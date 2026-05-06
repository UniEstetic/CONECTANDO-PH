import { NextResponse } from 'next/server'

import { auth } from "@/app/api/auth/[...nextauth]/auth.config";

export default auth((req) => {
  const { nextUrl } = req;

  const hasAccessToken = !!req.auth?.accessToken;
  const hasSessionError = !!req.auth?.error;
  const isLoggedIn = !!req.auth && hasAccessToken && !hasSessionError;

  // 🔐 NUEVO: obtener roles desde el token
  const roles = req.auth?.user?.userProfile?.roles || [];

  const rolesLimpios = roles.map((r: any) =>
    r.name.toLowerCase().trim()
  );

  // 1. Definir qué rutas son de autenticación (donde no quieres que esté si ya entró)
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  
  // 2. Permitir siempre las rutas de la API de Auth
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return NextResponse.next();

  // 3. Si es una ruta de login y ya está logueado, mandarlo al dashboard/home
  //    (excepto reset-password que debe ser accesible siempre)
  if (isAuthRoute) {
    const isResetPassword = nextUrl.pathname.startsWith("/auth/reset-password");
    if (isLoggedIn && !isResetPassword) {
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
