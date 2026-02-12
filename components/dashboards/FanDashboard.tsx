"use client";

import React from "react";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { GroupCard } from "@/components/groups/GroupCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary"; // Importamos diccionario

interface FanDashboardProps {
  userSession: any;
  groupsData: any[];
  userPredictions: any[];
  loadingData: boolean;
  lang: Language; // 👈 Recibimos el idioma
  onLogout: () => void;
}

export const FanDashboard = ({
  userSession,
  groupsData,
  userPredictions,
  loadingData,
  lang, // 👈 Lo usamos
  onLogout,
}: FanDashboardProps) => {
  const t = DICTIONARY[lang]; // 👈 Cargamos los textos correctos

  return (
    <main className="min-h-screen p-4 md:p-8 transition-colors duration-300 bg-transparent dark:bg-transparent relative">
      <StarBackground />
      <CloudsBackground />

      {/* HEADER */}
      <div className="relative z-20 flex justify-between items-center max-w-[1600px] mx-auto mb-4">
        <div className="text-white/80 text-xs">
          {t.hello}, {/* "Hola" o "Hello" */}
          <span className="font-bold text-cyan-400 ml-1">
            {userSession?.username}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full text-red-200 text-xs transition-all"
        >
          {t.logout} {/* "Cerrar Sesión" o "Log Out" */}
        </button>
      </div>

      {/* TÍTULO */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 pb-2 relative z-10">
        {t.appTitle} {/* "Mi Polla..." o "World Cup Pool..." */}
      </h1>

      <div className="flex justify-center mb-8 relative z-10">
        <ThemeToggle />
      </div>

      {/* CONTENIDO */}
      {loadingData ? (
        <div className="text-center text-white z-10 relative animate-pulse">
          {t.loadingGroups}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center relative z-10">
          {groupsData?.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              lang={lang} // 👈 Pasamos el idioma REAL, ya no el del index
              initialPredictions={userPredictions}
            />
          ))}
        </div>
      )}
    </main>
  );
};
