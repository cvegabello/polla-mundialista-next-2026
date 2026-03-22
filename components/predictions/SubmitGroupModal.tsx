"use client";

import React, { useState } from "react";
import { AlertTriangle, Trophy } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface Team {
  id: number;
  name_es: string;
  name_en: string;
  flag_code: string;
}

interface SubmitGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (championId: number) => void;
  teams: Team[];
  lang: Language;
  isLoading: boolean;
}

export const SubmitGroupModal = ({
  isOpen,
  onClose,
  onConfirm,
  teams,
  lang,
  isLoading,
}: SubmitGroupModalProps) => {
  // 🚀 LA CORRECCIÓN: Lo manejamos como texto ("") para evitar el maldito NaN
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const t = DICTIONARY[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      <div className="relative w-full max-w-lg bg-[#0a0500] border-2 border-red-600 rounded-2xl shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-red-600/20 border-b border-red-600/50 p-6 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-950 flex items-center justify-center border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <AlertTriangle className="text-red-500 w-8 h-8" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            {t.modalSubmitTitle || "¡CONFIRMACIÓN FINAL!"}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-300 text-center text-sm sm:text-base font-medium leading-relaxed bg-red-950/20 p-4 rounded-xl border border-red-900/30">
            {t.modalSubmitWarning ||
              "Si envías tus pronósticos ahora, quedarán BLOQUEADOS..."}
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-amber-500 font-bold text-sm tracking-wide">
              <Trophy size={18} />
              {t.modalSubmitChampLabel || "Elige a tu Campeón del Mundo:"}
            </label>

            <div className="relative">
              {/* 🚀 LA CORRECCIÓN: No forzamos Number() aquí, dejamos que fluya el texto */}
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-black border border-orange-700 text-white font-bold rounded-xl p-4 appearance-none outline-none focus:border-amber-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
              >
                <option value="" disabled>
                  {t.modalSubmitChampPlaceholder || "Selecciona un equipo..."}
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id.toString()}>
                    {lang === "es" ? team.name_es : team.name_en}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                ▼
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black border-t border-orange-900/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-400 bg-[#111] hover:bg-[#222] hover:text-white transition-colors border border-gray-800 disabled:opacity-50"
          >
            {t.modalSubmitBtnCancel || "VOLVER"}
          </button>

          <button
            onClick={() => {
              // 🚀 LA CORRECCIÓN: Aquí sí lo convertimos a número para mandarlo a la BD
              if (selectedTeam !== "") onConfirm(selectedTeam as any);
            }}
            disabled={selectedTeam === "" || isLoading}
            className="flex-1 py-3 px-4 rounded-xl font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none"
          >
            {isLoading
              ? "Enviando..."
              : t.modalSubmitBtnConfirm || "ACEPTAR Y ENVIAR"}
          </button>
        </div>
      </div>
    </div>
  );
};
