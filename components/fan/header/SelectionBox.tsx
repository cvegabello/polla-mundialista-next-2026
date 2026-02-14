import React from "react";

// Definimos los estilos según el "sabor" (variant) de la caja
const VARIANTS = {
  blue: {
    containerBorder: "border-gray-700 hover:border-gray-500",
    iconColor: "text-purple-400",
    titleColor: "text-gray-400",
    activeBtn:
      "bg-linear-to-r from-blue-600 to-cyan-600 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]",
  },
  gold: {
    containerBorder: "border-yellow-500/30 hover:border-yellow-500/60",
    iconColor: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]",
    titleColor: "text-yellow-500",
    activeBtn:
      "bg-linear-to-r from-yellow-600 to-amber-500 border-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]",
  },
};

interface SelectionBoxProps {
  title: string;
  icon: React.ReactNode;
  variant?: "blue" | "gold"; // Por defecto será blue
  currentValue: string;
  onOptionSelect: (value: string) => void;
  options: { label: string; value: string }[];
}

export const SelectionBox = ({
  title,
  icon,
  variant = "blue",
  currentValue,
  onOptionSelect,
  options,
}: SelectionBoxProps) => {
  const theme = VARIANTS[variant];

  // Estilo base del botón inactivo (el gris con hover neón)
  const btnBase =
    "flex-1 py-2 px-3 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-lg border border-gray-700 bg-[#1a1b26] text-gray-400 transition-all duration-300 cursor-pointer shadow-sm hover:text-white hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]";

  // Estilo activo (depende del theme)
  const btnActive = `flex-1 py-2 px-3 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-lg text-white transform scale-105 cursor-default border ${theme.activeBtn}`;

  return (
    <div
      className={`flex flex-col w-full max-w-xs p-4 rounded-xl bg-[#0f1016] border shadow-xl transition-colors group ${theme.containerBorder}`}
    >
      {/* HEADER: TÍTULO E ÍCONO */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className={theme.iconColor}>
          {icon} {/* Renderizamos el ícono que nos pasen */}
        </span>
        <span
          className={`text-xs font-bold uppercase tracking-widest ${theme.titleColor}`}
        >
          {title}
        </span>
      </div>

      {/* BOTONES DINÁMICOS */}
      <div className="flex gap-3 px-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onOptionSelect(opt.value)}
            className={currentValue === opt.value ? btnActive : btnBase}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
