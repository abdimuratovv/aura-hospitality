import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE_NAME, getSessionSecretKey } from './lib/jwt.js';

// Next.js 16 renamed Middleware to Proxy (same mechanism, new file/export name) —
// see node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md.
//
// Every route already calls getSession() itself (see src/lib/session.js), so this
// isn't the only auth check — it's a second, centralized gate so a route handler
// that forgets to check session doesn't silently serve data. /api/auth/* is
// excluded since those are the login/logout/me bootstrap endpoints themselves.
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await jwtVerify(token, getSessionSecretKey());
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
