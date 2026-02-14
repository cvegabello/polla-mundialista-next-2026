import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { Rocket, CheckCircle, Lock } from "lucide-react";

interface SubmitZoneProps {
  lang: Language;
  isSubmitted: boolean;
  isComplete: boolean;
  progress: number;
  total: number;
  onSubmit: () => void;
}

export const SubmitZone = ({
  lang,
  isSubmitted,
  isComplete,
  progress,
  total,
  onSubmit,
}: SubmitZoneProps) => {
  const t = DICTIONARY[lang];

  // Estilos del Botón (Más compacto)
  const btnDisabled =
    "bg-[#1a1b26] border border-gray-700 text-gray-500 cursor-not-allowed shadow-none opacity-60";

  const btnActive =
    "bg-linear-to-r from-emerald-400 to-green-500 text-[#0a2f15] border border-green-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] cursor-pointer animate-pulse-slow";

  const btnSubmitted =
    "bg-green-900/20 border border-green-500/50 text-green-400 cursor-default";

  return (
    // CAMBIO: max-w-2xl (Más angosto)
    <div className="w-full max-w-2xl mx-auto mb-6 relative z-20">
      {/* PANEL CONTENEDOR (Padding reducido a p-6) */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0f1016] border border-gray-700 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Decoración de fondo */}
        {isComplete && !isSubmitted && (
          <div className="absolute inset-0 bg-green-500/5 blur-3xl pointer-events-none" />
        )}

        {isSubmitted ? (
          // ESTADO: YA ENVIADO
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-base tracking-widest uppercase w-full justify-center ${btnSubmitted}`}
            >
              <CheckCircle size={20} />
              {t.submittedLabel}
            </div>
            <span className="text-gray-400 text-xs mt-2 flex items-center gap-1">
              <Lock size={12} /> Tus pronósticos están blindados
            </span>
          </div>
        ) : (
          // ESTADO: BORRADOR
          <div className="flex flex-col items-center gap-4 w-full">
            {/* BOTÓN DE ENVÍO (Más pequeño: py-4, text-base) */}
            <button
              onClick={onSubmit}
              disabled={!isComplete}
              className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-base md:text-lg tracking-[0.2em] uppercase transition-all duration-300 w-full shadow-lg group ${
                isComplete ? btnActive : btnDisabled
              }`}
            >
              <Rocket
                size={20}
                className={`transition-transform duration-500 ${isComplete ? "group-hover:-translate-y-1 group-hover:translate-x-1" : ""}`}
              />
              {t.submitButton}
            </button>

            {/* INFORMACIÓN DE PROGRESO */}
            {!isComplete ? (
              <div className="text-center flex flex-col items-center gap-1">
                {/* CAMBIO: Mensaje Blanco y un poco más grande */}
                <p className="text-white text-base font-medium drop-shadow-md">
                  {t.submitWarning}
                </p>

                {/* CAMBIO: Contador Grande y Neón (Oro o Verde) */}
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                  Progreso:
                  <span
                    className={`ml-2 text-2xl font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] ${
                      isComplete
                        ? "text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                        : "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                    }`}
                  >
                    {progress}/{total}
                  </span>
                </p>
              </div>
            ) : (
              // Mensaje cuando ya está completo (antes de enviar)
              <p className="text-green-400 text-sm font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
                {t.readyMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
