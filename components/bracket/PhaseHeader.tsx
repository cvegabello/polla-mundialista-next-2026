import React from "react";
import { Trophy, Lock, Send } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface PhaseHeaderProps {
  title: string;
  isActive: boolean;
  lang: Language;
  onAction?: () => void;
}

export const PhaseHeader = ({
  title,
  isActive,
  lang,
  onAction,
}: PhaseHeaderProps) => {
  const t = DICTIONARY[lang];
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
