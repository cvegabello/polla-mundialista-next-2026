import React from "react";

interface BracketContainerProps {
  children: React.ReactNode;
  footer?: React.ReactNode; // 👈 NUEVO: Recibimos la fila maestra de pastillas
}

export const BracketContainer = ({
  children,
  footer,
}: BracketContainerProps) => {
  return (
    <div
      className="w-full h-[calc(100vh-180px)] overflow-auto custom-scrollbar 
                    bg-slate-900/60 backdrop-blur-xl rounded-3xl 
                    border border-white/10 
                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative"
    >
      {/* Usamos flex-col para apilar la zona de partidos y la zona de pastillas */}
      <div className="flex flex-col min-w-max min-h-full">
        {/* ⚽ ZONA SUPERIOR: Las Columnas de los partidos */}
        <div className="flex flex-row items-start pl-8 pt-6 pb-6 gap-6 flex-1">
          {children}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </div>

        {/* 🏆 ZONA INFERIOR: La fila de pastillas fijada al fondo */}
        {footer && (
          <div className="sticky bottom-0 z-50 pl-8 pb-4">{footer}</div>
        )}
      </div>
    </div>
  );
};
