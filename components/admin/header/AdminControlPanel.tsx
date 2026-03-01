import React from "react";
import { Zap, FileText, Trophy, Settings } from "lucide-react";

interface AdminControlPanelProps {
  lang: string;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const AdminControlPanel = ({
  lang,
  currentView,
  onViewChange,
}: AdminControlPanelProps) => {
  // 🌍 Diccionario Bilingüe
  const t = {
    title: lang === "en" ? "CONTROL PANEL" : "PANEL DE CONTROL",
    groups: lang === "en" ? "Groups" : "Grupos",
    finals: lang === "en" ? "Finals Phase" : "Fase Final",
    settings: lang === "en" ? "Settings" : "Configuración",
  };

  // Función para darle estilo al botón dependiendo de si está seleccionado o no
  const getBtnStyle = (viewName: string) => {
    const base =
      "flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs md:text-sm transition-all duration-300 shadow-md";
    if (currentView === viewName) {
      // ESTILO ACTIVO (Rojo SuperAdmin)
      return `${base} bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500 cursor-default scale-105 z-10`;
    }
    // ESTILO INACTIVO
    return `${base} bg-[#14151f] text-gray-400 border border-gray-800 hover:text-white hover:border-gray-600 hover:bg-[#1a1b26] cursor-pointer`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0a0a0e] border border-red-900/30 rounded-3xl p-5 shadow-2xl relative z-20 mt-2 mb-6">
      {/* Título con el Rayito */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <Zap
          size={20}
          className="text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
        />
        <h3 className="text-orange-500 font-black tracking-[0.2em] text-sm md:text-base italic uppercase">
          {t.title}
        </h3>
      </div>

      {/* Los 3 Botones de Navegación */}
      <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
        <button
          onClick={() => onViewChange("groups")}
          className={getBtnStyle("groups")}
        >
          <FileText size={18} />
          {t.groups}
        </button>

        <button
          onClick={() => onViewChange("finals")}
          className={getBtnStyle("finals")}
        >
          <Trophy
            size={18}
            className={
              currentView === "finals" ? "text-yellow-400" : "text-yellow-600"
            }
          />
          {t.finals}
        </button>

        <button
          onClick={() => onViewChange("settings")}
          className={getBtnStyle("settings")}
        >
          <Settings size={18} />
          {t.settings}
        </button>
      </div>
    </div>
  );
};
