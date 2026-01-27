// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value;
  const path = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/', '/', '/'];
  const isPublicPath = publicPaths.some(p => path.startsWith(p));

  // Si es una ruta pública y el usuario está autenticado, redirigir al dashboard
  if (isPublicPath && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si es una ruta protegida y no hay token, redirigir al login
  if (!isPublicPath && !sessionToken) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};