import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("polla_session")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname.startsWith("/login");
  // 🔑 DEFINIMOS LA EXCEPCIÓN: Si la ruta empieza por /api/seed
  const isSeedPage = pathname.startsWith("/api/seed");

  // Si no hay sesión, NO es el login y NO es el seed, ¡pa fuera!
  if (!session && !isLoginPage && !isSeedPage) {
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
