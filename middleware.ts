import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("polla_session")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname.startsWith("/login");

  // 🔑 DEFINIMOS LAS EXCEPCIONES VIP:
  const isSeedPage = pathname.startsWith("/api/seed");
  const isMockPage = pathname.startsWith("/api/mock-scores"); // 👈 NUEVO PASE VIP AÑADIDO

  // Si no hay sesión, NO es el login, NO es el seed, y NO es el mock, ¡pa fuera!
  if (!session && !isLoginPage && !isSeedPage && !isMockPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si ya tiene sesión y trata de entrar al login, ¡pa dentro!
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
