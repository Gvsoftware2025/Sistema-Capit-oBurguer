import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deixa passar: dashboard e suas sub-rotas, API, arquivos estáticos
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Qualquer outra rota redireciona para /dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
