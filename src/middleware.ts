import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicAuthRoutes = ['/login', '/recuperar-senha']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl
  const isPublicAuthRoute = publicAuthRoutes.includes(pathname)

  if (!token && !isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
