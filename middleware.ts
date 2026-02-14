import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Intentamos sacar el bizcocho del bolsillo
  const session = request.cookies.get("polla_session")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // Si no hay bizcocho y no está en el login, ¡pa fuera!
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si ya tiene el bizcocho y trata de entrar al login, ¡pa dentro!
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
