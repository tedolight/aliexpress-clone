import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function decodeRoleFromJwt(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Pad base64 string
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const decoded = atob(padded)
    const json = JSON.parse(decoded)
    return json?.role ?? null
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect the admin dashboard route
  if (pathname.startsWith('/admin')) {
    const auth = req.headers.get('authorization') || ''
    let token = ''
    if (auth.startsWith('Bearer ')) token = auth.substring(7)

    // Also allow token from cookie or query for client-side navigations
    if (!token) token = req.cookies.get('token')?.value || ''

    const role = token ? decodeRoleFromJwt(token) : null
    if (role !== 'admin') {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}


