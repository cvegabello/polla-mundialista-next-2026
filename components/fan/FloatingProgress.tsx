import React from "react";
import { ArrowUpCircle, CheckCircle } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface FloatingProgressProps {
  current: number;
  total: number;
  isVisible: boolean;
  lang: Language;
}

export const FloatingProgress = ({
  current,
  total,
  isVisible,
  lang,
}: FloatingProgressProps) => {
  const t = DICTIONARY[lang];
  const isComplete = current >= total;

  // Si no debe verse, lo ocultamos con opacidad y translate
  const visibleClass = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10 pointer-events-none";

  // Función para subir al tope suavemente
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${visibleClass}`}
    >
      <button
        onClick={scrollToTop}
        className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border transition-all hover:scale-105 ${
          isComplete
            ? "bg-green-900/80 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            : "bg-slate-900/80 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        }`}
      >
        {isComplete ? (
          <>
            <CheckCircle size={20} className="animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wider">
              {t.floatingReady}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-medium uppercase text-white/80 mr-1">
              {t.progressLabel}
            </span>
            <span className="font-black text-lg font-mono">
              {current}/{total}
            </span>
            {/* Barrita de progreso mini */}
            <div className="w-16 h-1 bg-white/20 rounded-full ml-2 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${(current / total) * 100}%` }}
              />
            </div>
          </>
        )}
      </button>
    </div>
  );
};
