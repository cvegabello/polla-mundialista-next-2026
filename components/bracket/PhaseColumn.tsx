import React from "react";
import { PhaseHeader } from "@/components/bracket/PhaseHeader";
import { Language } from "@/components/constants/dictionary";

interface PhaseColumnProps {
  title: string;
  isActive: boolean;
  lang: Language;
  showFloating?: boolean;
  children?: React.ReactNode;
  isOfficial?: boolean;
}

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  title,
  isActive,
  lang,
  showFloating = false,
  children,
  isOfficial,
}) => {
  return (
    // 'h-full' asegura que todas las columnas midan exactamente lo mismo (lo que mida la más alta)
    <div className="flex flex-col w-[280px] shrink-0 relative h-full">
      <div className="bg-transparent pt-6 pb-6 mb-2">
        <PhaseHeader
          title={title}
          isActive={isActive}
          lang={lang}
          isOfficial={isOfficial}
        />
      </div>

      <div className="flex flex-col gap-4 pb-12">{children}</div>
    </div>
  );
};
