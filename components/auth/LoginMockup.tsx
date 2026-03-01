"use client";

import React, { useState, useEffect } from "react";
import { getActivePollas } from "@/services/pollaService";
import { loginOrRegister } from "@/services/authService";
import { LoginForm } from "@/components/ui/LoginForm";
import { LoginImageCard } from "@/components/ui/LoginImageCard";
// 👇 IMPORTANTE: Para la redirección
import { useRouter } from "next/navigation";

interface LoginMockupProps {
  onLoginSuccess: () => void;
}

export const LoginMockup = ({ onLoginSuccess }: LoginMockupProps) => {
  const router = useRouter(); // 👈 Inicializamos el router
  const [language, setLanguage] = useState("es");
  const [group, setGroup] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [poolOptions, setPoolOptions] = useState<any[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("polla_lang");
    if (savedLang) setLanguage(savedLang);
    const lastPolla = localStorage.getItem("last_selected_polla");
    if (lastPolla) setGroup(lastPolla);
  }, []);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("polla_lang", val);
  };

  useEffect(() => {
    const loadPollas = async () => {
      try {
        setIsLoadingPools(true);

        // 🕵️‍♂️ BUSCAMOS LA LLAVE SECRETA:
        // Si la URL es: localhost:3000/login?admin=true
        const params = new URLSearchParams(window.location.search);
        const isAdminMode = params.get("admin") === "true";

        const pollas = await getActivePollas(isAdminMode); // 👈 Le pasamos la verdad
        setPoolOptions(pollas);
      } catch (err) {
        console.error("Error cargando pollas:", err);
      } finally {
        setIsLoadingPools(false);
      }
    };
    loadPollas();
  }, []);

  useEffect(() => {
    if (group) localStorage.setItem("last_selected_polla", group);
  }, [group]);

  const handleLogin = async () => {
    setErrorMsg("");

    if (!group) {
      setErrorMsg(language === "es" ? "Selecciona una Polla" : "Select a Pool");
      return;
    }
    if (!username.trim() || pin.length < 4) {
      setErrorMsg(language === "es" ? "Datos incompletos" : "Incomplete data");
      return;
    }

    setLoading(true);

    try {
      // 1. Buscamos el nombre de la polla que seleccionó
      const selectedPool = poolOptions.find((p) => p.value === group);
      const isMantenimiento = selectedPool?.label === "Mantenimiento";

      // 2. Intentamos el ingreso
      const result = await loginOrRegister(username, pin, group);

      if (result.success && result.user) {
        const userRole = result.user.role;

        // 🛑 EL FILTRO DE SEGURIDAD:
        // Si la polla es Mantenimiento pero el usuario NO es SUPER-ADMIN...
        if (isMantenimiento && userRole !== "SUPER-ADMIN") {
          setErrorMsg(
            "Acceso denegado: Usted no tiene permisos de SuperAdmin en esta polla.",
          );
          setLoading(false);
          return; // ✋ Bloqueamos aquí: No se crean cookies, no hay redirección.
        }

        // --- Si pasó el filtro, seguimos con la sesión normal ---
        const sessionData = {
          id: result.user.id,
          username: result.user.username,
          role: userRole,
          polla_id: result.user.polla_id,
          polla_name: selectedPool?.label ?? "",
          lang: language,
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
            poolOptions={poolOptions}
            isLoadingPools={isLoadingPools}
            group={group}
            setGroup={setGroup}
            isGroupOpen={isGroupOpen}
            setIsGroupOpen={setIsGroupOpen}
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
