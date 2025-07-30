import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple JWT verification for Edge Runtime
async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    // Split the JWT
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode the header and payload
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    // For development, we'll do a simple check
    // In production, you should implement proper signature verification
    return true;
  } catch (error) {
    console.log('JWT verification error:', error);
    return false;
  }
}



export function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check if user is trying to access login or register page
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'
  ) {
    const token = request.cookies.get('auth-token');
    console.log('Login page access - Token:', token ? 'exists' : 'not found');

    // If user is already authenticated, redirect to dashboard
    if (token) {
      // For now, just check if token exists and has the right format
      if (token.value.split('.').length === 3) {
        console.log('Valid token found, redirecting to dashboard');
        return NextResponse.redirect(new URL('/', request.url));
      } else {
        console.log('Invalid token format');
      }
    }
    return NextResponse.next();
  }

  // For all other routes, check authentication
  const token = request.cookies.get('auth-token');
  console.log(
    'Protected route access - Token:',
    token ? 'exists' : 'not found'
  );

  if (!token) {
    // No token found, redirect to login
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if token has the right format
  if (token.value.split('.').length !== 3) {
    console.log('Invalid token format, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });
    return response;
  }

  console.log('Token format valid, allowing access');
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
