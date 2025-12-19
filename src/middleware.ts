import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protected routes that require authentication
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // If user is already logged in, redirect from auth pages to dashboard
  if (token && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};
