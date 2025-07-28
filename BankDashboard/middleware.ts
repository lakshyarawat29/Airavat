import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['banker', 'auditor', 'manager', 'admin'],
  '/live-feed': ['banker', 'manager', 'admin'],
  '/send-mail': ['banker', 'manager', 'admin'],
  '/analytics': ['auditor', 'manager', 'admin'],
  '/admin': ['admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and API routes
  if (pathname === '/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if the route requires authentication
  const requiresAuth = Object.keys(protectedRoutes).some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (requiresAuth) {
    // In a real app, you would check for a valid session/token here
    // For now, we'll let the client-side handle the redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

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
