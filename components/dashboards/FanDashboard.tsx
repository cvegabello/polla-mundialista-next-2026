"use client";

import React from "react";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { GroupCard } from "@/components/groups/GroupCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

// Componentes del Header y Navegación
import { FanHeader } from "@/components/fan/header/FanHeader";
import { FloatingProgress } from "@/components/fan/FloatingProgress";

// Componentes del Bracket
import { BracketContainer } from "@/components/bracket/BracketContainer";
import { PhaseColumn } from "@/components/bracket/PhaseColumn";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";

// Hook de Lógica
import { useFanDashboardLogic } from "@/hooks/useFanDashboardLogic";

interface FanDashboardProps {
  userSession: any;
  groupsData: any[];
  userPredictions: any[];
  loadingData: boolean;
  lang: Language;
}

export const FanDashboard = ({
  userSession,
  groupsData,
  userPredictions,
  loadingData,
  lang,
}: FanDashboardProps) => {
  const t = DICTIONARY[lang];

  const {
    currentView,
    setCurrentView,
    progress,
    totalMatches,
    showFloating,
    handleSubmit,
    hasSubmitted,
    handlePredictionChange,
    bracketMatches, // 👈 TRAEMOS LOS MATCHES DEL HOOK
    isLoadingBracket, // 👈 TRAEMOS EL ESTADO DE CARGA
  } = useFanDashboardLogic(userPredictions, userSession?.id);

  const isLocked = !!userSession?.submission_date || hasSubmitted;

  const headerSession = isLocked
    ? {
        ...userSession,
        submission_date:
          userSession?.submission_date || new Date().toISOString(),
      }
    : userSession;

  const handleInternalLogout = () => {
    document.cookie =
      "polla_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    localStorage.removeItem("polla_session");
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen transition-colors duration-300 bg-transparent dark:bg-transparent relative pb-20 overflow-hidden">
      {/* ☁️ ESTRELLAS Y NUBES */}
      <StarBackground />
      <CloudsBackground />

      {/* 🟦 ENCABEZADO */}
      <FanHeader
        userSession={headerSession}
        lang={lang}
        onLogout={handleInternalLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
        totalPredictions={progress}
        totalMatches={totalMatches}
        onSubmitPredictions={handleSubmit}
      />

      {/* 🟥 CONTENIDO DINÁMICO */}
      <div className="relative z-10 px-4">
        {loadingData ? (
          <div className="text-center text-white animate-pulse mt-12 font-bold tracking-widest">
            {t.loadingGroups}
          </div>
        ) : (
          <div className="w-full">
            {/* VISTA 1: FASE DE GRUPOS */}
            {currentView === "pred_groups" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center">
                {groupsData?.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    lang={lang}
                    initialPredictions={userPredictions}
                    onPredictionChange={handlePredictionChange}
                    isLocked={isLocked}
                  />
                ))}
              </div>
            )}

            {/* VISTA 2: FASE FINAL (Bracket Dinámico) */}
            {(currentView === "pred_finals" ||
              currentView === "res_finals") && (
              <div className="max-w-[1600px] mx-auto mt-4">
                {isLoadingBracket ? (
                  <div className="flex justify-center items-center h-64 text-cyan-400 font-bold animate-pulse tracking-widest text-lg">
                    CALCULANDO LLAVES...
                  </div>
                ) : (
                  <BracketContainer>
                    {/* --- COLUMNA 16AVOS --- */}
                    <PhaseColumn
                      title={lang === "es" ? "16avos de Final" : "Round of 32"}
                      isActive={currentView === "pred_finals"}
                    >
                      {/* 🚀 MAPEO DINÁMICO DE LOS PARTIDOS CALCULADOS */}
                      {bracketMatches.length > 0 ? (
                        bracketMatches.map((match, idx) => (
                          <BracketMatchCard
                            key={match.id}
                            matchCode={`M${match.id}`}
                            // Aplicamos márgenes alternados para dar efecto de "llave"
                            style={
                              idx % 2 !== 0
                                ? { marginTop: "-8px" }
                                : { marginTop: "30px" }
                            }
                            homeTeam={{
                              seed: match.h, // Código original (Ej: A1)
                              name: match.home.name, // Nombre real (Ej: México)
                            }}
                            awayTeam={{
                              seed: match.a,
                              name: match.away.name,
                            }}
                          />
                        ))
                      ) : (
                        <div className="text-white/50 text-xs p-4 bg-slate-900/50 rounded-lg text-center border border-white/10">
                          {lang === "es"
                            ? "Completa la fase de grupos para ver las llaves."
                            : "Complete group stage to see matchups."}
                        </div>
                      )}
                    </PhaseColumn>

                    {/* --- COLUMNAS FUTURAS (OCTAVOS, CUARTOS...) --- */}
                    {/* Aquí irán apareciendo las siguientes fases cuando conectemos la lógica de ganadores */}
                    <PhaseColumn
                      title={lang === "es" ? "Octavos" : "Round of 16"}
                      isActive={false}
                    />
                    <PhaseColumn
                      title={lang === "es" ? "Cuartos" : "Quarter Finals"}
                      isActive={false}
                    />
                    <PhaseColumn
                      title={lang === "es" ? "Semifinal" : "Semi Finals"}
                      isActive={false}
                    />
                    <PhaseColumn
                      title={lang === "es" ? "Gran Final" : "World Cup Final"}
                      isActive={false}
                    />
                  </BracketContainer>
                )}
              </div>
            )}

            {/* VISTA 3: RESULTADOS OFICIALES GRUPOS */}
            {currentView === "res_groups" && (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-white/50 bg-slate-900/40 backdrop-blur-md mx-auto max-w-2xl rounded-xl border border-white/10 p-8 shadow-2xl">
                <p className="text-xl mb-2 text-cyan-400 font-bold uppercase tracking-tighter">
                  Resultados FIFA
                </p>
                <p className="text-sm">
                  Aquí se cargarán los resultados reales de los grupos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🟢 BARRA FLOTANTE DE PROGRESO */}
      {currentView === "pred_groups" && !isLocked && (
        <FloatingProgress
          current={progress}
          total={totalMatches}
          isVisible={showFloating}
          lang={lang}
        />
      )}
    </main>
  );
};
