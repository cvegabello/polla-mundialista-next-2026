import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { UserStats } from "./UserStats";
import { ActionMenu } from "./ActionMenu";
import { NavigationBox } from "./NavigationBox";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SubmitZone } from "./SubmitZone"; // 👇 Importar la nueva zona

interface FanHeaderProps {
  userSession: any;
  lang: Language;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  totalPredictions: number;
  totalMatches: number;
  onSubmitPredictions?: () => void;
}

export const FanHeader = ({
  userSession,
  lang,
  onLogout,
  currentView,
  onViewChange,
  totalPredictions,
  totalMatches,
  onSubmitPredictions,
}: FanHeaderProps) => {
  const t = DICTIONARY[lang];
  const isSubmitted = !!userSession?.submission_date;
  const isComplete = totalPredictions >= totalMatches;

  const getTitle = () => {
    switch (currentView) {
      case "pred_groups":
        return t.viewPredGroups;
      case "pred_finals":
        return t.viewPredFinals;
      case "res_groups":
        return t.viewResGroups;
      case "res_finals":
        return t.viewResFinals;
      default:
        return t.viewPredGroups;
    }
  };

  return (
    <header className="flex flex-col items-center w-full px-4 pt-6 pb-4 relative z-30">
      {/* BOTÓN DE TEMA */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* 1. TÍTULO PRINCIPAL */}
      <h1 className="text-3xl md:text-5xl font-black text-center mb-2 mt-2 text-transparent bg-clip-text bg-linear-to-b from-gray-900 to-orange-600 dark:from-white dark:to-cyan-200 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-tighter transition-all duration-300">
        {t.worldCupTitle}
      </h1>

      {/* 2. PANEL DE USUARIO */}
      <UserStats
        username={userSession?.username}
        pollaName={userSession?.polla_name}
        points={1000}
        submissionDate={userSession?.submission_date}
        lang={lang}
      />

      {/* 3. MENÚ DE ACCIONES */}
      <ActionMenu lang={lang} onLogout={onLogout} />

      {/* 4. CAJAS DE NAVEGACIÓN */}
      <NavigationBox
        lang={lang}
        currentView={currentView}
        onViewChange={onViewChange}
      />

      {/* 5. TÍTULO DE LA VISTA ACTUAL */}
      <div className="mb-3 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400">
          {getTitle()}
        </h2>
        <div className="h-1 w-24 mx-auto bg-linear-to-r from-cyan-500 to-purple-500 rounded-full mt-2 opacity-60"></div>
      </div>

      {/* 6. ZONA DE ENVÍO (Solo visible en 'Mis Pronósticos - Fase de Grupos') */}
      {currentView === "pred_groups" && (
        <SubmitZone
          lang={lang}
          isSubmitted={isSubmitted}
          isComplete={isComplete}
          progress={totalPredictions} // OJO: Acuérdese de quitar el 48 quemado si ya terminó de probar
          total={totalMatches}
          onSubmit={onSubmitPredictions || (() => {})}
        />
      )}
    </header>
  );
};
