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
  // Estado inicial visual (mientras carga la lógica real)
  const [language, setLanguage] = useState("es");

  const [group, setGroup] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Estados Data y Formulario
  const [poolOptions, setPoolOptions] = useState<any[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 👇 1. EL CEREBRO DE IDIOMA (Se ejecuta UNA sola vez al iniciar)
  useEffect(() => {
    // A. ¿Qué hay en el Storage?
    const savedLang = localStorage.getItem("polla_lang");

    if (savedLang) {
      // CASO 1: Hay algo guardado. ¡Eso es sagrado!
      console.log("Idioma recuperado del storage:", savedLang);
      setLanguage(savedLang);
    } else {
      // CASO 2: Storage vacío. Miramos la máquina.
      const browserLang = navigator.language || navigator.languages[0];
      console.log("Idioma detectado de máquina:", browserLang);

      if (browserLang.toLowerCase().startsWith("es")) {
        // Máquina en Español -> Español
        setLanguage("es");
      } else {
        // Máquina en Alemán, Chino, Ruso o Inglés -> Inglés
        setLanguage("en");
      }
    }
  }, []); // El array vacío [] asegura que esto SOLO pase una vez al montar.

  // 👇 2. FUNCIÓN MANUAL PARA CAMBIAR IDIOMA
  // Esta función reemplaza al setLanguage directo en el combo
  const handleLanguageChange = (val: string) => {
    setLanguage(val); // Cambia visualmente
    localStorage.setItem("polla_lang", val); // Guarda en piedra
    console.log("Nuevo idioma guardado:", val);
  };

  // 3. Recuperar última polla (Igual que antes)
  useEffect(() => {
    const lastPolla = localStorage.getItem("last_selected_polla");
    if (lastPolla) setGroup(lastPolla);
  }, []);

  // 4. Guardar polla al cambiar
  useEffect(() => {
    if (group) localStorage.setItem("last_selected_polla", group);
  }, [group]);

  // 5. Carga de Pollas (BD)
  useEffect(() => {
    const loadPollas = async () => {
      try {
        setIsLoadingPools(true);
        const pollas = await getActivePollas();
        setPoolOptions(pollas);
      } catch (err) {
        console.error("Error cargando pollas");
      } finally {
        setIsLoadingPools(false);
      }
    };
    loadPollas();
  }, []);

  // 6. Login
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
    const result = await loginOrRegister(username, pin, group);

    if (result.success && result.user) {
      if (result.isNewUser) {
        alert(
          language === "es"
            ? "¡Bienvenido! Usuario creado."
            : "Welcome! User created.",
        );
      }
      const sessionData = {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        polla_id: result.user.polla_id,
      };
      localStorage.setItem("polla_session", JSON.stringify(sessionData));
      onLoginSuccess();
    } else {
      setErrorMsg(result.message || "Error desconocido");
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
            // 👇 AQUÍ USAMOS NUESTRA NUEVA FUNCIÓN CONTROLADA
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
