import React from "react";
import { LogOut } from "lucide-react"; // 👈 Quitamos el import de Settings

interface AdminActionMenuProps {
  lang: string;
  onLogout: () => void;
}

export const AdminActionMenu = ({ lang, onLogout }: AdminActionMenuProps) => {
  const btnBaseClass =
    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border border-gray-800 bg-[#14151f] cursor-pointer group shadow-lg";

  // 🌍 Textos dinámicos
  const btnExit = lang === "en" ? "EXIT PANEL" : "SALIR DEL PANEL";

  return (
    <div className="flex justify-center relative z-20">
      <div className="inline-flex flex-wrap items-center justify-center gap-4 p-2.5 rounded-2xl bg-[#0a0a0e] border border-gray-800 shadow-2xl">
        {/* 🚪 BOTÓN: SALIR (ÚNICO Y FUNCIONAL) */}
        <button
          onClick={onLogout}
          className={`${btnBaseClass} text-red-500 border-red-900/30 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]`}
        >
          <LogOut
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>{btnExit}</span>
        </button>
      </div>
    </div>
  );
};
