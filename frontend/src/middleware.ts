import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Route Protection
 * Prevents unauthenticated access to the Enterprise / B2B workspace space (/app/*).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strictly protect all /app routes (including /app, /app/onboarding, /app/*)
  if (pathname.startsWith('/app')) {
    const sessionCookie = request.cookies.get('zadesk_session');

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};

