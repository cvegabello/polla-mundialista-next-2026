import React, { useState, useEffect } from "react";
import { Trophy, Lock, Send, ShieldCheck } from "lucide-react"; // 👈 Agregamos ShieldCheck para el icono oficial
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface PhaseHeaderProps {
  title: string;
  isActive: boolean;
  lang: Language;
  onAction?: () => void;
  isOfficial?: boolean; // 👈 NUEVO: Bandera para saber qué vista mostrar
}

export const PhaseHeader = ({
  title,
  isActive,
  lang,
  onAction,
  isOfficial = false, // 👈 Por defecto es false para que NO afecte los pronósticos
}: PhaseHeaderProps) => {
  const t = DICTIONARY[lang];

  // 🏆 1. VISTA DE RESULTADOS OFICIALES (Sin botones, más compacta, letra más grande)
  if (isOfficial) {
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-[#1a1b26]/90 border border-cyan-500/50 rounded-xl backdrop-blur-sm shadow-lg w-full transition-all duration-300">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-cyan-400" />
          <span className="text-sm font-black uppercase tracking-[0.15em] text-cyan-400 text-center drop-shadow-md">
            {title}
          </span>
        </div>
        {/* Le ponemos el subtítulo de "Resultados Oficiales" bien elegante */}
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

  // 👇 2. PROTECCIÓN NUCLEAR: Si no ha montado en el cliente, devolvemos un cascarón vacío
  if (!isMounted) {
    // Un div vacío con un poquito de altura para que la pantalla no salte
    return <div className="w-full min-h-[60px]"></div>;
  }

  // 📝 2. VISTA DE PRONÓSTICOS (Su código original, intacto)
  return (
    <div className="flex flex-col gap-4 p-4 bg-black border border-orange-500/80 rounded-2xl backdrop-blur-sm shadow-2xl w-full transition-all duration-300">
      {/* Título */}
      <div className="flex items-center justify-center gap-2 w-full">
        <div className="text-orange-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.5)]">
          <Trophy size={18} />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-300 text-center">
          {title}
        </span>
      </div>

      {/* BOTONES */}
      <div className="w-full">
        <button
          onClick={isActive ? onAction : undefined}
          disabled={!isActive}
          className={`
            w-full py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2
            ${
              isActive
                ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] hover:scale-[1.02] cursor-pointer"
                : "bg-slate-800/50 text-slate-400 border-2 border-white/20 cursor-not-allowed uppercase"
            }
          `}
        >
          {!isActive && <Lock size={14} className="opacity-70" />}
          {isActive && <Send size={14} />}
          {isActive ? t.bracketSubmitBtn : t.bracketPhaseLocked}
        </button>
      </div>
    </div>
  );
};
