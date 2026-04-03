"use client";

import { Suspense } from "react";
import { LoginMockup } from "@/components/auth/LoginMockup";
// import { AppFooter } from "@/components/shared/AppFooter"; // (Déjelo si lo está usando, si no, bórrelo)

export default function LoginPage() {
  const handleLoginSuccess = () => {
    // Cuando el login sea exitoso, mandamos a la raíz
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      {/* Aquí metemos al jugador en la burbuja de Suspense que pide el árbitro */}
      <Suspense fallback={<div className="text-white">Cargando...</div>}>
        <LoginMockup onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    </main>
  );
}
