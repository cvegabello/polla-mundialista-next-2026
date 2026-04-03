import React from "react";

// Le agregamos la propiedad lang para saber en qué idioma está la página
interface AppFooterProps {
  lang?: "es" | "en";
}

export const AppFooter = ({ lang = "es" }: AppFooterProps) => {
  // 👇 Aquí controla la versión manualmente
  const APP_VERSION = "BETA v1.0";

  // 👇 Aquí pone el nuevo nombre oficial de su app
  const APP_NAME = "TiqueBet";

  // Traducciones automáticas
  const textDev =
    lang === "en" ? "Designed and developed by" : "Diseñado y desarrollado por";
  const textCopy =
    lang === "en" ? `${APP_NAME} © VegaSoft` : `${APP_NAME} © VegaSoft`;

  return (
    // bg-white/50 de día, bg-black/50 de noche
    <div className="w-full flex flex-col items-center justify-center py-2 mt-12 border-t border-slate-300 dark:border-orange-500/20 relative z-10 bg-linear-to-b from-black via-[#020205] to-[#0a1e3b] dark:bg-black/50 backdrop-blur-sm rounded-3xl">
      {/* text-slate-700 de día, text-gray-400 de noche */}
      <p className="text-slate-400 dark:text-gray-400 text-sm font-semibold tracking-wide text-center px-4">
        <span className="block md:inline">{textDev} </span>
        {/* text-black de día, text-gray-200 de noche */}
        <span className="block md:inline text-white dark:text-gray-200 mt-1 md:mt-0 font-bold">
          Carlos Vega
        </span>
      </p>

      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1 mb-4 text-center font-medium">
        {textCopy}
      </p>

      <div className="px-4 py-1 border border-orange-500/80 rounded-full bg-orange-950/90 dark:bg-orange-950/30 shadow-[0_0_10px_rgba(249,115,22,0.1)] dark:shadow-[0_0_10px_rgba(249,115,22,0.2)]">
        <span className="text-amber-400 text-[12px] font-semibold tracking-widest uppercase">
          {APP_VERSION}
        </span>
      </div>
    </div>
  );
};
