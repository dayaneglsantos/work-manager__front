// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Verifique aqui o NOME EXATO do seu cookie!
  const token = request.cookies.get('token')?.value

  // Pega o caminho que o usuário está tentando acessar
  const { pathname } = request.nextUrl

  // 2. Se o usuário NÃO tem token e está tentando acessar qualquer rota
  // que NÃO seja a de login, redirecione-o para a página de login.
  if (!token && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Se o usuário TEM um token e está tentando acessar a página de login,
  // redirecione-o para a home. Isso evita que usuários logados vejam a tela de login.
  if (token && pathname === '/login') {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Se nenhuma das condições acima for atendida, permite que a requisição continue.
  return NextResponse.next()
}

// O matcher define ONDE o middleware vai rodar.
// Esta configuração faz com que ele rode em TODAS as rotas,
// exceto as de arquivos estáticos e imagens da API do Next.js.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
