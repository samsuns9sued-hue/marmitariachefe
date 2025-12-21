import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verifica se está tentando acessar a rota /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Ignora a própria página de login para não dar loop infinito
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Verifica se tem o cookie de sessão
    const temSessao = request.cookies.get('admin_session')

    if (!temSessao) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}