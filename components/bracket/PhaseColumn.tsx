import React from "react";
import { PhaseHeader } from "@/components/bracket/PhaseHeader";

interface PhaseColumnProps {
  title: string;
  isActive: boolean;
  children?: React.ReactNode;
}

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  title,
  isActive,
  children,
}) => {
  return (
    <div className="flex flex-col w-[280px] shrink-0">
      {/* ❄️ Cabecera Pegajosa "Cero Huecos"
          - sticky: El imán.
          - top-[-24px]: Compensa el padding del contenedor para tocar el borde.
          - z-20: Siempre encima de las tarjetas.
          - bg-transparent: Sin fondos, 100% como usted lo pidió.
      */}
      <div className="sticky top-[-24px] z-20 bg-transparent pt-6 pb-6 mb-2">
        <PhaseHeader title={title} isActive={isActive} />
      </div>

      <div className="flex flex-col gap-4 pb-10">{children}</div>
    </div>
  );
};
