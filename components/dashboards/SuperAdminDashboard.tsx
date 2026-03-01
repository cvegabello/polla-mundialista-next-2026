"use client";

import React, { useState, useEffect } from "react";
import { AdminGroupCard } from "@/components/groups/AdminGroupCard";
import { SuperAdminHeader } from "@/components/admin/header/SuperAdminHeader";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { AdminKnockoutBoard } from "@/components/admin/bracket/AdminKnockoutBoard";

interface SuperAdminDashboardProps {
  groupsData: any[];
  officialMatches: any[];
  lang: Language;
}

export const SuperAdminDashboard = ({
  groupsData,
  officialMatches,
  lang = "es",
}: SuperAdminDashboardProps) => {
  const t = DICTIONARY[lang];
  const [isMounted, setIsMounted] = useState(false);

  // 🧠 MEMORIA DE NAVEGACIÓN: Por defecto arranca en Grupos
  const [currentView, setCurrentView] = useState("groups");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <main className="min-h-screen bg-black"></main>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Pasamos la memoria al encabezado */}
      <SuperAdminHeader
        lang={lang}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="max-w-[87%] mx-auto p-4 md:p-6">
        {/* ⚽ VISTA 1: FASE DE GRUPOS */}
        {currentView === "groups" && (
          <>
            <div className="flex items-center gap-3 mb-8 border-l-4 border-red-600 pl-4">
              <h2 className="text-2xl font-black uppercase tracking-widest text-gray-200">
                {t.btnGroups} <span className="text-red-500">|</span>{" "}
                {lang === "en" ? "Official Results" : "Resultados Oficiales"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 max-w-[1600px] mx-auto justify-items-center">
              {groupsData
                .filter((group) => group.id !== "FI")
                .map((group) => (
                  <AdminGroupCard key={group.id} group={group} lang={lang} />
                ))}
            </div>
          </>
        )}

        {/* 🏆 VISTA 2: FINALES */}
        {currentView === "finals" && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-8 border-l-4 border-yellow-500 pl-4">
              <h2 className="text-2xl font-black uppercase tracking-widest text-gray-200">
                {lang === "en" ? "Final Phase" : "Fase Final"}{" "}
                <span className="text-yellow-500">|</span>{" "}
                {lang === "en" ? "Official Bracket" : "Llaves Oficiales"}
              </h2>
            </div>
            {/* AQUÍ METEMOS EL TABLERO */}
            <AdminKnockoutBoard
              groupsData={groupsData}
              officialMatches={officialMatches}
              lang={lang}
            />
          </div>
        )}

        {/* ⚙️ VISTA 3: CONFIGURACIÓN (Próximamente) */}
        {currentView === "settings" && (
          <div className="flex flex-col items-center justify-center mt-20 opacity-50 border-2 border-dashed border-gray-800 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-purple-400 mb-4 uppercase tracking-widest">
              {lang === "en" ? "System Settings" : "Configuración del Sistema"}
            </h2>
            <p className="text-gray-400 font-bold tracking-widest uppercase">
              {lang === "en"
                ? "Locks and rules coming soon..."
                : "Candados y reglas en construcción..."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};
