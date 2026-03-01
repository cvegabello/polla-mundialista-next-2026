"use client";

import React from "react";
import { AdminHeaderBar } from "./AdminHeaderBar";
import { AdminActionMenu } from "./AdminActionMenu";
import { AdminControlPanel } from "./AdminControlPanel"; // 👈 Importamos el panel
import { logoutAction } from "@/lib/actions/auth-actions";

interface SuperAdminHeaderProps {
  lang: string;
  currentView: string; // 👈 Agregamos estas dos props
  onViewChange: (view: string) => void;
}

export const SuperAdminHeader = ({
  lang,
  currentView,
  onViewChange,
}: SuperAdminHeaderProps) => {
  const title = lang === "en" ? "WORLD CUP 2026" : "COPA MUNDIAL 2026";
  const reportsComingSoon =
    lang === "en"
      ? "Admin Reports Coming Soon"
      : "Próximamente Reportes de Admin";

  return (
    <header className="w-full pt-6 pb-2 px-4 flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-sm">
          {title}
        </h1>
        <div className="h-1.5 w-32 mx-auto bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full mt-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
      </div>

      <AdminHeaderBar lang={lang} />

      <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4 justify-center items-center w-full">
        <div className="opacity-50 text-[10px] text-gray-500 uppercase font-bold border border-gray-800 px-4 py-2 rounded-lg">
          {reportsComingSoon}
        </div>
        <AdminActionMenu lang={lang} onLogout={() => logoutAction()} />
      </div>

      {/* 👈 AQUÍ PONEMOS EL PANEL DE NAVEGACIÓN */}
      <AdminControlPanel
        lang={lang}
        currentView={currentView}
        onViewChange={onViewChange}
      />
    </header>
  );
};
