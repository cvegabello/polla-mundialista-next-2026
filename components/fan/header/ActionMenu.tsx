import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { LogOut, Save, RefreshCw } from "lucide-react";

interface ActionMenuProps {
  lang: Language;
  onLogout: () => void;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  onRefresh: () => void;
}

export const ActionMenu = ({
  lang,
  onLogout,
  hasUnsavedChanges,
  onManualSave,
  onRefresh,
}: ActionMenuProps) => {
  const t = DICTIONARY[lang];

  const btnBaseClass =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-700 bg-[#1a1b26] cursor-pointer relative group shadow-sm";

  return (
    <div className="flex justify-center relative z-20">
      <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-[#0f1016] border border-gray-700 shadow-xl">
        {/* 🔄 BOTÓN 1: REFRESCAR */}
        <button
          onClick={onRefresh}
          className={`${btnBaseClass} text-cyan-400 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]`}
        >
          <RefreshCw
            size={16}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
          <span>{lang === "en" ? "Refresh" : "Refrescar"}</span>
        </button>

        {/* 💾 BOTÓN 2: GUARDAR (Dinámico) */}
        <button
          onClick={onManualSave}
          disabled={!hasUnsavedChanges}
          className={`${btnBaseClass} ${
            hasUnsavedChanges
              ? "text-amber-400 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse hover:bg-amber-500/10"
              : "text-gray-500 border-gray-700 cursor-not-allowed"
          }`}
        >
          <Save
            size={16}
            className={
              hasUnsavedChanges
                ? "group-hover:scale-110 transition-transform duration-300"
                : ""
            }
          />
          <span>
            {hasUnsavedChanges
              ? lang === "en"
                ? "Save Changes"
                : "Guardar Cambios"
              : lang === "en"
                ? "Saved"
                : "Guardado"}
          </span>
        </button>

        {/* 🚪 BOTÓN 3: SALIR */}
        <button
          onClick={onLogout}
          className={`${btnBaseClass} text-red-400 hover:text-red-300 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500/10`}
        >
          <LogOut
            size={16}
            className="text-red-500 group-hover:rotate-12 transition-transform duration-300"
          />
          <span>{t.menuExit}</span>
        </button>
      </div>
    </div>
  );
};
