import React from "react";

interface AdminBracketContainerProps {
  children: React.ReactNode;
}

export const AdminBracketContainer = ({
  children,
}: AdminBracketContainerProps) => {
  return (
    <div
      className="w-full h-[calc(100vh-150px)] overflow-auto custom-scrollbar 
                 bg-[#161722]/90 backdrop-blur-xl rounded-3xl 
                 border-2 border-red-600/60 
                 shadow-[inset_0_0_40px_rgba(220,38,38,0.15),0_0_20px_rgba(0,0,0,0.5)] relative"
    >
      <div className="flex flex-col min-w-max min-h-full">
        {/* ⚽ ZONA SUPERIOR: Las Columnas de los partidos */}
        <div className="flex flex-row items-start pl-8 pt-6 pb-6 gap-6 flex-1">
          {children}
          {/* Espacio extra al final para que el scroll no quede pegado */}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
