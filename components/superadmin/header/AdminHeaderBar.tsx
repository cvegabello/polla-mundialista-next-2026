import React from "react";

interface AdminHeaderBarProps {
  lang: string;
}

export const AdminHeaderBar = ({ lang }: AdminHeaderBarProps) => {
  // 🌍 Textos dinámicos
  const subtitle =
    lang === "en" ? "Official Control Panel" : "Panel de Control Oficial";
  const title = lang === "en" ? "SUPER ADMINISTRATOR" : "SUPER ADMINISTRADOR";

  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-3 px-6 py-4 rounded-full bg-[#0f1016]/80 border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.15)] relative z-20 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <span className="text-red-500 text-xs md:text-sm font-black tracking-[0.2em] uppercase mb-1">
          {subtitle}
        </span>
        <h2 className="text-xl md:text-3xl font-bold text-white tracking-wider uppercase flex items-center gap-3">
          <span className="text-red-500">👑</span>
          {title}
          <span className="text-red-500">👑</span>
        </h2>
      </div>
    </div>
  );
};
