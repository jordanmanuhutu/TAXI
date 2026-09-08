import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'taxi_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check only whether a session cookie exists.
  // Session validity is checked by the server-side application.
  const session = req.cookies.get(COOKIE_NAME)?.value;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL('/login', req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*).*)'],
};
