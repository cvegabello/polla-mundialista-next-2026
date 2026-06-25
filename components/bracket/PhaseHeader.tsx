import React, { useState, useEffect } from "react";
import { Trophy, Lock, Send, ShieldCheck } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface PhaseHeaderProps {
  title: string;
  isActive: boolean;
  lang: Language;
  onAction?: () => void;
  isOfficial?: boolean;
  isSubmitted?: boolean;
}

export const PhaseHeader = ({
  title,
  isActive,
  lang,
  onAction,
  isOfficial = false,
  isSubmitted = false,
}: PhaseHeaderProps) => {
  const t = DICTIONARY[lang];

  // 🏆 1. VISTA DE RESULTADOS OFICIALES
  if (isOfficial) {
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-[#1a1b26]/90 border border-cyan-500/50 rounded-xl backdrop-blur-sm shadow-lg w-full transition-all duration-300">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-cyan-400" />
          <span className="text-sm font-black uppercase tracking-[0.15em] text-cyan-400 text-center drop-shadow-md">
            {title}
          </span>
        </div>
        <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mt-1">
          {lang === "en" ? "Official Results" : "Resultados Oficiales"}
        </span>
      </div>
    );
  }

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full min-h-[60px]"></div>;
  }

  // 📝 2. VISTA DE PRONÓSTICOS
  return (
    // Aseguramos un fondo sólido oscuro para que resalte el neón
    <div className="flex flex-col gap-4 p-4 bg-[#0a0b10] border border-orange-500/80 rounded-2xl backdrop-blur-md shadow-2xl w-full transition-all duration-300">
      {/* Título */}
      <div className="flex items-center justify-center gap-2 w-full">
        <div className="text-orange-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.5)]">
          <Trophy size={18} />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-300 text-center">
          {title}
        </span>
      </div>

      {/* ESTADO DE ENVÍO */}
      {isSubmitted && (
        <div className="w-full">
          <div className="mt-1 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 w-full py-3 px-2 bg-emerald-950 border-2 border-emerald-500 rounded-xl text-emerald-300 font-bold tracking-widest cursor-default text-xs uppercase shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <svg
                className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,1)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-white/80 text-[12px] flex items-center gap-1.5 font-medium mt-1">
                {lang === "en"
                  ? "Predictions Submitted"
                  : "Pronósticos Enviados"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
