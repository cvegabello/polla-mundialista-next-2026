"use client";

import React, { useState, useEffect } from "react";
// 1. Componentes de Auth
import { LoginMockup } from "@/components/auth/LoginMockup";

// 2. Componentes Visuales (LOS VIEJOS)
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// 3. Componente Funcional (EL NUEVO, QUE YA TIENE LÓGICA INTERNA)
// Nota: Asegúrate de importar el GroupCard "inteligente" que acabamos de arreglar.
// Si tu GroupCard nuevo está en folder 'fan', usa esa ruta. Si está en 'groups', usa 'groups'.
// Yo usaré la ruta del último que trabajamos:
import { GroupCard } from "@/components/groups/GroupCard";

// 4. Servicio de Datos (EL QUE ACABAMOS DE CREAR)
import { getFullGroupsData } from "@/services/groupService";

export default function Home() {
  // --- ESTADOS DEL SEMÁFORO ---
  const [view, setView] = useState<"loading" | "login" | "fan" | "admin">(
    "loading",
  );
  const [userSession, setUserSession] = useState<any>(null);

  // --- ESTADOS DE DATOS ---
  const [groupsData, setGroupsData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // 1. VALIDAR SESIÓN AL ENTRAR
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem("polla_session");
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
        setView(parsedSession.role === "ADMIN_GRUPO" ? "admin" : "fan");
      } else {
        setView("login");
      }
    };
    checkSession();
  }, []);

  // 2. CARGAR DATOS (Solo si ya entró)
  useEffect(() => {
    if (view === "fan" || view === "admin") {
      const loadData = async () => {
        setLoadingData(true);
        const data = await getFullGroupsData(); // Llamamos a tu consulta original
        setGroupsData(data);
        setLoadingData(false);
      };
      loadData();
    }
  }, [view]);

  // --- HANDLERS ---
  const handleLoginSuccess = () => {
    const storedSession = localStorage.getItem("polla_session");
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setUserSession(parsedSession);
      setView(parsedSession.role === "ADMIN_GRUPO" ? "admin" : "fan");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("polla_session");
    setUserSession(null);
    setView("login");
    setGroupsData([]);
  };

  // ==========================================
  // RENDERIZADO (AQUÍ ESTÁ LA INTEGRACIÓN)
  // ==========================================

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        {/* Puedes poner aquí un spinner bonito si quieres */}
        <div className="animate-pulse">Cargando Polla Mundialista...</div>
      </div>
    );
  }

  if (view === "login") {
    return <LoginMockup onLoginSuccess={handleLoginSuccess} />;
  }

  // 👇 AQUÍ RESTAURAMOS TU DISEÑO ORIGINAL PARA EL FAN
  if (view === "fan") {
    return (
      <main className="min-h-screen p-4 md:p-8 transition-colors duration-300 bg-transparent dark:bg-transparent relative">
        {/* Fondos */}
        <StarBackground />
        <CloudsBackground />

        {/* Cabecera con Botón de Salir */}
        <div className="relative z-20 flex justify-between items-center max-w-[1600px] mx-auto mb-4">
          <div className="text-white/80 text-xs">
            Hola,{" "}
            <span className="font-bold text-cyan-400">
              {userSession?.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full text-red-200 text-xs transition-all"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Título Original */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 pb-2 relative z-10">
          Mi Polla Mundialista 2026
        </h1>

        {/* Toggle de Tema Original */}
        <div className="flex justify-center mb-8 relative z-10">
          <ThemeToggle />
        </div>

        {/* Grilla de Tarjetas (Cargando o Mostrando) */}
        {loadingData ? (
          <div className="text-center text-white z-10 relative animate-pulse">
            Trayendo los grupos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center relative z-10">
            {groupsData?.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                lang={index < 2 ? "es" : "en"} // Tu lógica original de idiomas
              />
            ))}
          </div>
        )}
      </main>
    );
  }

  // Vista Admin (Opcional, puede ser igual o diferente)
  if (view === "admin") {
    return (
      <div className="min-h-screen bg-[#1e1e1e] p-8">
        <div className="flex justify-between text-white mb-8">
          <h1 className="text-2xl font-bold text-yellow-500">Zona Admin</h1>
          <button
            onClick={handleLogout}
            className="text-red-400 border border-red-500 px-4 rounded"
          >
            Salir
          </button>
        </div>
        {/* El admin ve las tarjetas pero con la "Vista de Admin" interna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupsData?.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
