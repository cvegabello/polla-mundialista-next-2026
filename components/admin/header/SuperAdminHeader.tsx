"use client";

import React from "react";
import { AdminHeaderBar } from "./AdminHeaderBar";
import { AdminActionMenu } from "./AdminActionMenu";
import { logoutAction } from "@/lib/actions/auth-actions";

interface SuperAdminHeaderProps {
  lang: string;
}

export const SuperAdminHeader = ({ lang }: SuperAdminHeaderProps) => {
  // 🌍 Textos dinámicos según el idioma
  const title = lang === "en" ? "WORLD CUP 2026" : "COPA MUNDIAL 2026";
  const reportsComingSoon =
    lang === "en"
      ? "Admin Reports Coming Soon"
      : "Próximamente Reportes de Admin";

  return (
    <header className="w-full pt-6 pb-2 px-4 flex flex-col items-center">
      {/* 1. TÍTULO PRINCIPAL: MUNDIAL 2026 */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-sm">
          {title}
        </h1>
        <div className="h-1.5 w-32 mx-auto bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full mt-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
      </div>

      {/* 2. PANEL DE ESTADO: SUPER ADMINISTRADOR */}
      {/* Le pasamos el 'lang' para cuando lo traduzcamos en el siguiente paso */}
      <AdminHeaderBar lang={lang} />

      {/* 3. MENÚ DE ACCIONES (Donde vive el botón Salir) */}
      <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4 justify-center items-center w-full">
        {/* Aquí irá el ReportsMenu de Admin más adelante */}
        <div className="opacity-50 text-[10px] text-gray-500 uppercase font-bold border border-gray-800 px-4 py-2 rounded-lg">
          {reportsComingSoon}
        </div>

        {/* Le pasamos el 'lang' para traducirlo luego */}
        <AdminActionMenu lang={lang} onLogout={() => logoutAction()} />
      </div>
    </header>
  );
};
