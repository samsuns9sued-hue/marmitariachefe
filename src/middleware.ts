import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // --- 1. PROTEÇÃO DO ADMIN (Mantida igualzinha a antes) ---
  if (path.startsWith('/admin')) {
    // Se for a página de login, deixa passar
    if (path === '/admin/login') {
      return NextResponse.next()
    }

    // Se não tiver o cookie do admin, manda pro login
    const temSessao = request.cookies.get('admin_session')
    if (!temSessao) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // --- 2. PROTEÇÃO DO ENTREGADOR (Nova) ---
  if (path.startsWith('/entregador')) {
    // Se for a página de login, deixa passar
    if (path === '/entregador/login') {
      return NextResponse.next()
    }

    // Se não tiver o cookie do entregador, manda pro login
    const temSessao = request.cookies.get('entregador_session')
    if (!temSessao) {
      return NextResponse.redirect(new URL('/entregador/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configuração importante: Avisa ao Next.js para rodar esse arquivo
// tanto nas rotas /admin quanto nas rotas /entregador
export const config = {
  matcher: ['/admin/:path*', '/entregador/:path*'],
}