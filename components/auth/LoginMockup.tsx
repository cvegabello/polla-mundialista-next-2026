"use client";

import React, { useState, useEffect } from "react";
import { loginOrRegister } from "@/services/authService";
import { LoginForm } from "@/components/ui/LoginForm";
import { LoginImageCard } from "@/components/ui/LoginImageCard";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 Importamos useSearchParams

interface LoginMockupProps {
  onLoginSuccess: () => void;
}

export const LoginMockup = ({ onLoginSuccess }: LoginMockupProps) => {
  const router = useRouter();

  // 👇 Activamos el radar para leer la URL
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || ""; // Si no hay, queda vacío

  const [language, setLanguage] = useState("es");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("polla_lang");
    if (savedLang) setLanguage(savedLang);
    // Borramos lo de localStorage de pollas porque ya no lo necesitamos
  }, []);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("polla_lang", val);
  };

  const handleLogin = async () => {
    setErrorMsg("");

    if (!username.trim() || pin.length < 4) {
      setErrorMsg(language === "es" ? "Datos incompletos" : "Incomplete data");
      return;
    }

    setLoading(true);

    try {
      // 🚀 ATENCIÓN AL PASE: Ahora mandamos el inviteToken en vez del ID de la polla
      const result = await loginOrRegister(
        username,
        pin,
        inviteToken,
        language,
      );

      if (result.success && result.user) {
        const userRole = result.user.role;
        // Asumimos que su backend nos devolverá el nombre de la polla si lo necesitamos
        const pollaName = result.user.polla_name || "";
        const isMantenimiento = pollaName === "Mantenimiento";

        if (isMantenimiento && userRole !== "SUPER-ADMIN") {
          setErrorMsg(
            "Acceso denegado: Usted no tiene permisos de SuperAdmin en esta polla.",
          );
          setLoading(false);
          return;
        }

        const sessionData = {
          id: result.user.id,
          username: result.user.username,
          role: userRole,
          polla_id: result.user.polla_id,
          polla_name: pollaName,
          lang: language,
          sub_date_groups: result.user.sub_date_groups || null,
          sub_date_r32: result.user.sub_date_r32 || null,
          sub_date_r16: result.user.sub_date_r16 || null,
          sub_date_qf: result.user.sub_date_qf || null,
          sub_date_sf: result.user.sub_date_sf || null,
          sub_date_f: result.user.sub_date_f || null,
          submission_date:
            result.user.sub_date_groups || result.user.submission_date || null,
        };

        const cookieValue = encodeURIComponent(JSON.stringify(sessionData));
        document.cookie = `polla_session=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        localStorage.setItem("polla_session", JSON.stringify(sessionData));

        if (userRole === "SUPER-ADMIN") {
          router.push("/super-admin");
        } else if (userRole === "ADMIN-GRUPO") {
          router.push("/admin");
        } else {
          onLoginSuccess();
        }
      } else {
        setErrorMsg(result.message || "Error al ingresar");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error en el login:", err);
      setErrorMsg("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-black via-[#020205] to-[#0a1e3b] p-4 md:p-8 relative overflow-hidden">
      <div className="w-full max-w-5xl p-[2px] rounded-[26px] bg-linear-to-br from-cyan-400/50 via-blue-500/30 to-gray-300/20 shadow-2xl relative z-10">
        <div className="w-full h-full bg-linear-to-t from-[#050505] to-[#252525] rounded-3xl flex flex-col md:flex-row p-3">
          <LoginImageCard />
          <LoginForm
            language={language}
            setLanguage={handleLanguageChange}
            isLangOpen={isLangOpen}
            setIsLangOpen={setIsLangOpen}
            username={username}
            setUsername={setUsername}
            pin={pin}
            setPin={setPin}
            handleLogin={handleLogin}
            loading={loading}
            errorMsg={errorMsg}
          />
        </div>
      </div>
    </div>
  );
};
