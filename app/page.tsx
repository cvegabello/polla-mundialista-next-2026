"use client";

import React, { useState, useEffect } from "react";
import { LoginMockup } from "@/components/auth/LoginMockup";
import { FanDashboard } from "@/components/dashboards/FanDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { getFullGroupsData } from "@/services/groupService";
import { getUserPredictions } from "@/services/predictionService";

// Importamos el tipo Language
import { Language } from "@/components/constants/dictionary";

export default function Home() {
  const [view, setView] = useState<"loading" | "login" | "fan" | "admin">(
    "loading",
  );
  const [userSession, setUserSession] = useState<any>(null);

  // 👇 ESTADO PARA EL IDIOMA (Por defecto español, pero se actualiza rápido)
  const [currentLang, setCurrentLang] = useState<Language>("es");

  const [groupsData, setGroupsData] = useState<any[]>([]);
  const [userPredictions, setUserPredictions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // 1. VALIDAR SESIÓN E IDIOMA
  useEffect(() => {
    const checkSession = () => {
      // A. Recuperar Sesión
      const storedSession = localStorage.getItem("polla_session");
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
        setView(parsedSession.role === "ADMIN_GRUPO" ? "admin" : "fan");
      } else {
        setView("login");
      }

      // B. Recuperar Idioma (ESTO ES LO NUEVO) 🌍
      // El login guardó esto en "polla_lang"
      const storedLang = localStorage.getItem("polla_lang");
      if (storedLang === "en" || storedLang === "es") {
        setCurrentLang(storedLang);
      }
    };
    checkSession();
  }, []);

  // 2. CARGA DE DATOS
  useEffect(() => {
    if ((view === "fan" || view === "admin") && userSession?.id) {
      const loadData = async () => {
        setLoadingData(true);
        try {
          const [groups, predictions] = await Promise.all([
            getFullGroupsData(),
            getUserPredictions(userSession.id),
          ]);
          setGroupsData(groups);
          setUserPredictions(predictions);
        } catch (error) {
          console.error("Error cargando datos", error);
        } finally {
          setLoadingData(false);
        }
      };
      loadData();
    }
  }, [view, userSession]);

  const handleLoginSuccess = () => {
    // Al loguearse, volvemos a leer todo para asegurar sincronía
    const storedSession = localStorage.getItem("polla_session");
    const storedLang = localStorage.getItem("polla_lang"); // Leemos idioma recién guardado

    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setUserSession(parsedSession);
      setView(parsedSession.role === "ADMIN_GRUPO" ? "admin" : "fan");
    }

    if (storedLang === "en" || storedLang === "es") {
      setCurrentLang(storedLang);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("polla_session");
    // Nota: NO borramos "polla_lang" para recordar la preferencia del usuario
    setUserSession(null);
    setView("login");
    setGroupsData([]);
    setUserPredictions([]);
  };

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (view === "login") {
    return <LoginMockup onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === "fan") {
    return (
      <FanDashboard
        userSession={userSession}
        groupsData={groupsData}
        userPredictions={userPredictions}
        loadingData={loadingData}
        lang={currentLang} // 👈 ¡AQUÍ PASAMOS EL IDIOMA!
        onLogout={handleLogout}
      />
    );
  }

  if (view === "admin") {
    return (
      <AdminDashboard
        groupsData={groupsData}
        onLogout={handleLogout}
        // lang={currentLang} // Si quisiera que el admin también tenga idioma
      />
    );
  }

  return null;
}
