"use client";

import React, { useState, useEffect } from "react";
import { getActivePollas } from "@/services/pollaService";
import { loginOrRegister } from "@/services/authService";
import { LoginForm } from "@/components/ui/LoginForm";
import { LoginImageCard } from "@/components/ui/LoginImageCard";

interface LoginMockupProps {
  onLoginSuccess: () => void;
}

export const LoginMockup = ({ onLoginSuccess }: LoginMockupProps) => {
  // Estados de interfaz
  const [language, setLanguage] = useState("es");
  const [group, setGroup] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [poolOptions, setPoolOptions] = useState<any[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);

  // Estados de formulario
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Cargar idioma y última polla seleccionada
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
        const pollas = await getActivePollas();
        setPoolOptions(pollas);
      } catch (err) {
        console.error("Error cargando pollas:", err);
      } finally {
        setIsLoadingPools(false);
      }
    };
    loadPollas();
  }, []);

  // 2. Persistir polla seleccionada
  useEffect(() => {
    if (group) localStorage.setItem("last_selected_polla", group);
  }, [group]);

  // 3. LÓGICA DE LOGIN SENCILLA (Back to basics 🚀)
  const handleLogin = async () => {
    setErrorMsg("");

    // Validaciones básicas de interfaz
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
      // LLAMADA A TU SERVICIO ORIGINAL (Sin cambios en tu DB)
      const result = await loginOrRegister(username, pin, group);

      if (result.success && result.user) {
        if (result.isNewUser) {
          alert(
            language === "es"
              ? "¡Bienvenido! Usuario creado."
              : "Welcome! User created.",
          );
        }

        const selectedPool = poolOptions.find((p) => p.value === group);
        const sessionData = {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          polla_id: result.user.polla_id,
          polla_name: selectedPool?.label ?? "",
        };

        // 👇 LA "SERVILLETA" (CREACIÓN DE COOKIE MANUAL)
        // Guardamos los datos para que el servidor los pueda leer. Dura 30 días.
        const cookieValue = encodeURIComponent(JSON.stringify(sessionData));
        document.cookie = `polla_session=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

        // Guardamos en localStorage por si algún componente viejo todavía lo busca
        localStorage.setItem("polla_session", JSON.stringify(sessionData));

        // ¡ÉXITO! Mandamos al usuario a la pista de baile
        onLoginSuccess();
      } else {
        // Aquí sale tu mensaje de "PIN incorrecto" o "Usuario ya existe"
        setErrorMsg(result.message || "Error al ingresar");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error en el proceso de login:", err);
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
