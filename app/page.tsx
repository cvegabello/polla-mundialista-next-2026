"use client";

import React, { useState, useEffect } from "react";
import { LoginMockup } from "@/components/auth/LoginMockup";
import { FanDashboard } from "@/components/dashboards/FanDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { getFullGroupsData } from "@/services/groupService";
import { getUserPredictions } from "@/services/predictionService";
// 👇 Importamos esto para poder consultar la fecha real en Supabase
import { createBrowserClient } from "@supabase/ssr";

// Importamos el tipo Language
import { Language } from "@/components/constants/dictionary";

export default function Home() {
  const [view, setView] = useState<"loading" | "login" | "fan" | "admin">(
    "loading",
  );
  const [userSession, setUserSession] = useState<any>(null);

  // 👇 ESTADO PARA EL IDIOMA
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

      // B. Recuperar Idioma
      const storedLang = localStorage.getItem("polla_lang");
      if (storedLang === "en" || storedLang === "es") {
        setCurrentLang(storedLang);
      }
    };
    checkSession();
  }, []);

  // 2. CARGA DE DATOS (AQUÍ ESTÁ LA MAGIA NUEVA ✨)
  useEffect(() => {
    if ((view === "fan" || view === "admin") && userSession?.id) {
      const loadData = async () => {
        setLoadingData(true);

        // Inicializamos Supabase Cliente aquí mismo para no complicarnos
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        try {
          // Ejecutamos 3 promesas al tiempo: Grupos, Predicciones y PERFIL ACTUALIZADO
          const [groups, predictions, profileResponse] = await Promise.all([
            getFullGroupsData(),
            getUserPredictions(userSession.id),
            // 👇 Consultamos si ya envió la polla (submission_date)
            supabase
              .from("profiles")
              .select("submission_date")
              .eq("id", userSession.id)
              .single(),
          ]);

          setGroupsData(groups);
          setUserPredictions(predictions);

          // 👇 SI ENCONTRAMOS FECHA DE ENVÍO, ACTUALIZAMOS LA SESIÓN LOCAL
          if (profileResponse.data?.submission_date) {
            setUserSession((prev: any) => {
              const updated = {
                ...prev,
                submission_date: profileResponse.data.submission_date,
              };
              // (Opcional) Actualizamos el localStorage para que la próxima carga sea más rápida
              localStorage.setItem("polla_session", JSON.stringify(updated));
              return updated;
            });
          }
        } catch (error) {
          console.error("Error cargando datos", error);
        } finally {
          setLoadingData(false);
        }
      };
      loadData();
    }
  }, [view, userSession?.id]); // Ojo: dependemos del ID, no de toda la sesión para evitar loops

  const handleLoginSuccess = () => {
    // Al loguearse, volvemos a leer todo para asegurar sincronía
    const storedSession = localStorage.getItem("polla_session");
    const storedLang = localStorage.getItem("polla_lang");

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
        lang={currentLang}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "admin") {
    return <AdminDashboard groupsData={groupsData} onLogout={handleLogout} />;
  }

  return null;
}
