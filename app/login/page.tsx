"use client";

import { LoginMockup } from "@/components/auth/LoginMockup";
import { AppFooter } from "@/components/shared/AppFooter";
export default function LoginPage() {
  const handleLoginSuccess = () => {
    // Cuando el login sea exitoso, mandamos a la raíz
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <LoginMockup onLoginSuccess={handleLoginSuccess} />
    </main>
  );
}
