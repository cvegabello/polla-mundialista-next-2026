import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { SubmitZone } from "./SubmitZone";
import React, { useState, useEffect } from "react";

interface FanHeaderProps {
  userSession: any;
  lang: Language;
  currentView: string;
  totalPredictions: number;
  totalMatches: number;
  onSubmitPredictions?: (championId: any) => void;
  hasUnsavedChanges?: boolean;
  isSubmitAllowed?: boolean;
}

export const FanHeader = ({
  userSession,
  lang,
  currentView,
  totalPredictions,
  totalMatches,
  onSubmitPredictions,
  hasUnsavedChanges = false,
  isSubmitAllowed = true,
}: FanHeaderProps) => {
  const t = DICTIONARY[lang];
  const isSubmitted = !!userSession?.submission_date;
  const isComplete = totalPredictions >= totalMatches;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <header className="flex flex-col items-center w-full px-4 pt-4 pb-2 relative z-30">
      {/* TÍTULO PRINCIPAL (Opcional, si quiere que se vea grande en el centro además de la barra) */}
      <h1 className="text-3xl md:text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-orange-600 dark:from-white dark:to-cyan-200 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-tighter transition-all duration-300">
        {t.worldCupTitle}
      </h1>

      {/* ZONA DE ENVÍO */}
      {currentView === "pred_groups" && (
        <SubmitZone
          lang={lang}
          isSubmitted={isSubmitted}
          isComplete={isComplete}
          progress={totalPredictions}
          total={totalMatches}
          hasUnsavedChanges={hasUnsavedChanges}
          onSubmit={onSubmitPredictions || ((id: any) => {})}
          isSubmitAllowed={isSubmitAllowed}
        />
      )}
    </header>
  );
};
