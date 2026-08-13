import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isDashboardPath =
    pathname === '/' ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/settings');
  const isAuthPath = pathname === '/login';

  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/tasks', '/tasks/:path*', '/projects', '/projects/:path*', '/settings', '/settings/:path*'],
};
