"use client";

import React, { useState } from "react";
import { AdminHeaderBar } from "./AdminHeaderBar";
import { AdminActionMenu } from "./AdminActionMenu";
import { AdminControlPanel } from "./AdminControlPanel"; // 👈 Importamos el panel
import { logoutAction } from "@/lib/actions/auth-actions";
import { SuperAdminVarModal } from "@/components/superadmin/reportes/SuperAdminVarModal";
import { Trophy } from "lucide-react";
import { Language } from "@/components/constants/dictionary";

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
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const title = lang === "en" ? "WORLD CUP 2026" : "COPA MUNDIAL 2026";

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
        <button
          onClick={() => setIsVarModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-purple-700 bg-[#1a0f2e] text-purple-300 hover:text-white hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer group shadow-sm"
        >
          <Trophy
            size={16}
            className="text-purple-400 group-hover:scale-110 transition-transform duration-300"
          />
          <span>{lang === "en" ? "SUPER VAR" : "SÚPER VAR"}</span>
        </button>
        <AdminActionMenu lang={lang} onLogout={() => logoutAction()} />
      </div>

      {/* 👈 AQUÍ PONEMOS EL PANEL DE NAVEGACIÓN */}
      <AdminControlPanel
        lang={lang}
        currentView={currentView}
        onViewChange={onViewChange}
      />

      <SuperAdminVarModal 
        isOpen={isVarModalOpen} 
        onClose={() => setIsVarModalOpen(false)} 
        lang={lang as Language} 
      />
    </header>
  );
};
