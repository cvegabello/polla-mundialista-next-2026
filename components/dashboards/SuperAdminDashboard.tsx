"use client";

import React, { useState, useEffect } from "react";
import { AdminGroupCard } from "@/components/groups/AdminGroupCard";

interface SuperAdminDashboardProps {
  groupsData: any[];
}

export const SuperAdminDashboard = ({
  groupsData,
}: SuperAdminDashboardProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <main className="min-h-screen bg-black"></main>;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* ENCABEZADO DE SUPER ADMIN */}
      <header className="w-full bg-gradient-to-r from-red-900 to-black border-b border-red-500/30 p-6 shadow-lg shadow-red-900/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
              PANEL DE SUPER ADMIN 👑
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Gestor de Marcadores Oficiales (La Verdad Absoluta)
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors">
              Bloquear Fase de Grupos 🔒
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-lg border border-gray-600 transition-colors"
            >
              Volver al Fan View 🏠
            </a>
          </div>
        </div>
      </header>

      {/* GRILLA DE GRUPOS (MARCADORES OFICIALES) */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 mt-6">
        <h2 className="text-xl font-bold mb-6 border-l-4 border-red-500 pl-3">
          Fase de Grupos - Ingreso de Resultados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto justify-items-center">
          {groupsData
            .filter((group) => group.id !== "FI")
            .map((group) => (
              <div
                key={group.id}
                className="bg-gray-900 border border-red-900/30 rounded-xl p-4"
              >
                <AdminGroupCard group={group} lang="es" />

                {/* <AdminGroupCard group={group} /> */}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
};
