"use client";

import React, { useState, useEffect } from "react";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { GroupCard } from "@/components/groups/GroupCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import confetti from "canvas-confetti";
import { resolveBracketMatches } from "@/utils/bracket-resolver";

// Componentes del Header y Navegación
import { FanHeader } from "@/components/fan/header/FanHeader";
import { FloatingProgress } from "@/components/fan/FloatingProgress";

// Componentes del Bracket
import { BracketContainer } from "@/components/bracket/BracketContainer";
import { PhaseColumn } from "@/components/bracket/PhaseColumn";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";

// Hook de Lógica
import { useFanDashboardLogic } from "@/hooks/useFanDashboardLogic";
import { FloatingPhase } from "@/components/fan/FloatingPhase";
import { SystemAlerts } from "@/components/shared/SystemAlerts";
import { OfficialGroupsResults } from "@/components/dashboards/OfficialGroupsResults";
import { OfficialKnockoutResults } from "@/components/dashboards/OfficialKnockoutResults";

import {
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";

interface FanDashboardProps {
  userSession: any;
  groupsData: any[];
  userPredictions: any[];
  officialScores?: any[]; // 👈 NUEVO
  officialWinners?: Record<string, any>; // 👈 NUEVO
  loadingData: boolean;
  lang: Language;
}

const getFlagUrl = (code3: string | null | undefined): string | null => {
  if (!code3) return null;
  const map: Record<string, string> = {
    col: "co",
    mex: "mx",
    usa: "us",
    bra: "br",
    arg: "ar",
    por: "pt",
    esp: "es",
    fra: "fr",
    ger: "de",
    eng: "gb",
    uru: "uy",
    ecu: "ec",
    can: "ca",
    kor: "kr",
    jpn: "jp",
    sen: "sn",
    ned: "nl",
    bel: "be",
    cro: "hr",
    mar: "ma",
    sui: "ch",
    crc: "cr",
    irn: "ir",
    ksa: "sa",
    aus: "au",
    tun: "tn",
    pol: "pl",
    cmr: "cm",
    gha: "gh",
    hai: "ht",
    civ: "ci",
    alg: "dz",
    egy: "eg",
    qat: "qa",
    par: "py",
    nzl: "nz",
    cpv: "cv",
    nor: "no",
    aut: "at",
    jor: "jo",
    uzb: "uz",
    pan: "pa",
  };
  if (code3.includes("_rep_")) return null;
  const code2 = map[code3.toLowerCase()] || code3.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w80/${code2}.png`;
};

export const FanDashboard = ({
  userSession,
  groupsData,
  userPredictions,
  officialScores,
  officialWinners,
  loadingData,
  lang,
}: FanDashboardProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = DICTIONARY[lang];
  const [winnerTeam, setWinnerTeam] = useState<any>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const {
    currentView,
    setCurrentView,
    progress,
    totalMatches,
    showFloating,
    handleSubmit,
    hasSubmitted,
    handlePredictionChange,
    bracketMatches,
    isLoadingBracket,
    handleAdvanceTeam,
    knockoutWinners,
    handleSaveKnockoutPrediction,
    hasUnsavedChanges,
    handleManualSave,
    handleRefresh,
    handleGroupDataChange,
    systemModal,
    closeSystemModal,
    confirmRefresh,
    proceedWithLogout,
    handleLogoutAttempt,
  } = useFanDashboardLogic(userPredictions, userSession?.id, groupsData);

  // 🛠️ MODIFICACIÓN CLAVE: Manejo de persistencia del modal y limpieza de estados null/pendientes
  const handleInternalModalSave = async (
    groupId: string,
    matches: any[],
    tableData: any[],
  ) => {
    // 1. Sincronizamos los datos con el hook (esto internamente pone hasUnsavedChanges en true)
    handleGroupDataChange(groupId, matches, tableData);

    // 2. ⚡ FORZAMOS EL RESET: Ejecutamos el guardado manual pasando 'false'.
    // Esto limpia la lista de 'unsavedPredictions' en el hook y pone hasUnsavedChanges en false,
    // evitando que el botón del Header se active por residuos de valores null.
    if (typeof handleManualSave === "function") {
      setTimeout(async () => {
        await handleManualSave(false);
      }, 100); // Un pequeño delay asegura que el estado anterior se haya procesado
    }
  };

  const handleFinalAdvance = (
    matchId: string | number,
    winner: any,
    isFinalMatch: boolean,
    isManualAction: boolean = false, // 👈 Recibimos el chisme aquí
  ) => {
    handleAdvanceTeam(matchId, winner);

    if (isFinalMatch && winner && isManualAction) {
      setWinnerTeam(winner);
      const fireInitialBurst = () => {
        confetti({
          particleCount: 120,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.65 },
          colors: ["#fbbf24", "#f59e0b", "#fff", "#fb923c", "#a78bfa"],
          zIndex: 200,
          startVelocity: 55,
        });
        confetti({
          particleCount: 120,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.65 },
          colors: ["#fbbf24", "#f59e0b", "#fff", "#fb923c", "#a78bfa"],
          zIndex: 200,
          startVelocity: 55,
        });
      };

      fireInitialBurst();
      setTimeout(() => setShowWinnerModal(true), 600);

      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 40 * (timeLeft / duration);
        confetti({
          particleCount,
          startVelocity: 20,
          spread: 360,
          ticks: 80,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors: ["#fbbf24", "#ffffff", "#fb923c", "#a78bfa", "#34d399"],
          zIndex: 200,
        });
      }, 300);
    }
  };

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

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-black transition-colors duration-300"></main>
    );
  }

  return (
    <main className="min-h-screen transition-colors duration-300 bg-transparent dark:bg-transparent relative pb-20 overflow-x-hidden">
      <StarBackground />

      <FanHeader
        userSession={headerSession}
        lang={lang}
        onLogout={() => handleLogoutAttempt(handleInternalLogout)}
        currentView={currentView}
        onViewChange={setCurrentView}
        totalPredictions={progress}
        totalMatches={totalMatches}
        onSubmitPredictions={handleSubmit}
        hasUnsavedChanges={hasUnsavedChanges}
        onManualSave={handleManualSave}
        onRefresh={handleRefresh}
      />

      <div className="relative z-10 px-4">
        {loadingData ? (
          <div className="text-center text-white animate-pulse mt-12 font-bold tracking-widest">
            {t.loadingGroups}
          </div>
        ) : (
          <div className="w-full">
            <div
              className={`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center ${currentView === "pred_groups" ? "grid" : "hidden"}`}
            >
              {groupsData
                ?.filter((g) => g.id !== "FI")
                .map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    lang={lang}
                    initialPredictions={userPredictions}
                    onPredictionChange={handlePredictionChange}
                    isLocked={isLocked}
                    onGroupDirty={handleGroupDataChange}
                  />
                ))}
            </div>

            <div
              className={`max-w-[1600px] mx-auto mt-4 ${currentView === "pred_finals" ? "block" : "hidden"}`}
            >
              {isLoadingBracket ? (
                <div className="flex justify-center items-center h-64 text-cyan-400 font-bold animate-pulse tracking-widest text-lg">
                  {t.bracketLoading}
                </div>
              ) : (
                <BracketContainer
                  footer={
                    <div className="flex flex-row gap-6">
                      {[
                        t.bracketPhaseR32,
                        t.bracketPhaseR16,
                        t.bracketPhaseQF,
                        t.bracketPhaseSF,
                        t.bracketPhaseF,
                      ].map((phase, i) => (
                        <div
                          key={i}
                          className="w-[280px] shrink-0 flex justify-center"
                        >
                          <FloatingPhase
                            isVisible={showFloating}
                            title={phase}
                          />
                        </div>
                      ))}
                    </div>
                  }
                >
                  <PhaseColumn
                    title={t.bracketPhaseR32Full}
                    isActive={currentView === "pred_finals"}
                    lang={lang}
                    showFloating={showFloating}
                  >
                    {bracketMatches.length > 0 ? (
                      bracketMatches.map((match, idx) => (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 2 !== 0
                              ? { marginTop: "-8px" }
                              : { marginTop: "15px" }
                          }
                          homeTeam={{
                            id: match.home.id,
                            seed: match.h,
                            name: match.home.name_es || match.h,
                            name_es: match.home.name_es,
                            name_en: match.home.name_en,
                            flag: match.home.flag,
                            group: match.home.group,
                          }}
                          awayTeam={{
                            id: match.away.id,
                            seed: match.a,
                            name: match.away.name_es || match.a,
                            name_es: match.away.name_es,
                            name_en: match.away.name_en,
                            flag: match.away.flag,
                            group: match.away.group,
                          }}
                          prediction={userPredictions?.find(
                            (p) =>
                              p.match_id.toString() === match.id.toString(),
                          )}
                          onSavePrediction={handleSaveKnockoutPrediction}
                        />
                      ))
                    ) : (
                      <div className="text-white/50 text-xs p-4 bg-slate-900/50 rounded-lg text-center border border-white/10">
                        {t.bracketCompleteGroups}
                      </div>
                    )}
                  </PhaseColumn>

                  {/* Columnas de R16, QF, SF, F */}
                  <PhaseColumn
                    title={t.bracketPhaseR16Full}
                    isActive={false}
                    lang={lang}
                    showFloating={showFloating}
                  >
                    {R16_MATCHUPS.map((match, idx) => {
                      const homeWinner =
                        knockoutWinners[match.h.replace("W", "")];
                      const awayWinner =
                        knockoutWinners[match.a.replace("W", "")];
                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "125px" }
                              : { marginTop: "65px" }
                          }
                          homeTeam={{
                            id: homeWinner?.id,
                            seed: match.h,
                            name: homeWinner
                              ? homeWinner.name_es || homeWinner.name
                              : t.bracketTBD,
                            name_es: homeWinner?.name_es,
                            name_en: homeWinner?.name_en,
                            flag: homeWinner ? homeWinner.flag : null,
                          }}
                          awayTeam={{
                            id: awayWinner?.id,
                            seed: match.a,
                            name: awayWinner
                              ? awayWinner.name_es || awayWinner.name
                              : t.bracketTBD,
                            name_es: awayWinner?.name_es,
                            name_en: awayWinner?.name_en,
                            flag: awayWinner ? awayWinner.flag : null,
                          }}
                          prediction={userPredictions?.find(
                            (p) =>
                              p.match_id.toString() === match.id.toString(),
                          )}
                          onSavePrediction={handleSaveKnockoutPrediction}
                        />
                      );
                    })}
                  </PhaseColumn>

                  <PhaseColumn
                    title={t.bracketPhaseQFFull}
                    isActive={false}
                    lang={lang}
                    showFloating={showFloating}
                  >
                    {QF_MATCHUPS.map((match, idx) => {
                      const homeWinner =
                        knockoutWinners[match.h.replace("W", "")];
                      const awayWinner =
                        knockoutWinners[match.a.replace("W", "")];
                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "360px" }
                              : { marginTop: "200px" }
                          }
                          homeTeam={{
                            id: homeWinner?.id,
                            seed: match.h,
                            name: homeWinner
                              ? homeWinner.name_es || homeWinner.name
                              : t.bracketTBD,
                            name_es: homeWinner?.name_es,
                            name_en: homeWinner?.name_en,
                            flag: homeWinner ? homeWinner.flag : null,
                          }}
                          awayTeam={{
                            id: awayWinner?.id,
                            seed: match.a,
                            name: awayWinner
                              ? awayWinner.name_es || awayWinner.name
                              : t.bracketTBD,
                            name_es: awayWinner?.name_es,
                            name_en: awayWinner?.name_en,
                            flag: awayWinner ? awayWinner.flag : null,
                          }}
                          prediction={userPredictions?.find(
                            (p) =>
                              p.match_id.toString() === match.id.toString(),
                          )}
                          onSavePrediction={handleSaveKnockoutPrediction}
                        />
                      );
                    })}
                  </PhaseColumn>

                  <PhaseColumn
                    title={t.bracketPhaseSFFull}
                    isActive={false}
                    lang={lang}
                    showFloating={showFloating}
                  >
                    {SF_MATCHUPS.map((match, idx) => {
                      const homeWinner =
                        knockoutWinners[match.h.replace("W", "")];
                      const awayWinner =
                        knockoutWinners[match.a.replace("W", "")];
                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "850px" }
                              : { marginTop: "450px" }
                          }
                          homeTeam={{
                            id: homeWinner?.id,
                            seed: match.h,
                            name: homeWinner
                              ? homeWinner.name_es || homeWinner.name
                              : t.bracketTBD,
                            name_es: homeWinner?.name_es,
                            name_en: homeWinner?.name_en,
                            flag: homeWinner ? homeWinner.flag : null,
                          }}
                          awayTeam={{
                            id: awayWinner?.id,
                            seed: match.a,
                            name: awayWinner
                              ? awayWinner.name_es || awayWinner.name
                              : t.bracketTBD,
                            name_es: awayWinner?.name_es,
                            name_en: awayWinner?.name_en,
                            flag: awayWinner ? awayWinner.flag : null,
                          }}
                          prediction={userPredictions?.find(
                            (p) =>
                              p.match_id.toString() === match.id.toString(),
                          )}
                          onSavePrediction={handleSaveKnockoutPrediction}
                        />
                      );
                    })}
                  </PhaseColumn>

                  <PhaseColumn
                    title={t.bracketPhaseFTitle}
                    isActive={false}
                    lang={lang}
                    showFloating={showFloating}
                  >
                    {resolveBracketMatches(
                      groupsData,
                      knockoutWinners,
                      F_MATCHUPS,
                    ).map((match, idx) => {
                      const isFinal = idx === 0;
                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          lang={lang}
                          onAdvanceTeam={(id, w, isManual) =>
                            handleFinalAdvance(id, w, isFinal, isManual)
                          }
                          isFinal={isFinal}
                          style={
                            idx % 2 !== 0
                              ? { marginTop: "60px" } // Tercer Puesto
                              : { marginTop: "15px" } // Final
                          }
                          homeTeam={{
                            ...match.home,
                            seed: match.h,
                            name: match.home.id
                              ? lang === "en"
                                ? match.home.name_en || match.home.name_es
                                : match.home.name_es
                              : t.bracketTBD,
                          }}
                          awayTeam={{
                            ...match.away,
                            seed: match.a,
                            name: match.away.id
                              ? lang === "en"
                                ? match.away.name_en || match.away.name_es
                                : match.away.name_es
                              : t.bracketTBD,
                          }}
                          prediction={userPredictions?.find(
                            (p) =>
                              p.match_id.toString() === match.id.toString(),
                          )}
                          onSavePrediction={handleSaveKnockoutPrediction}
                        />
                      );
                    })}
                  </PhaseColumn>
                </BracketContainer>
              )}
            </div>
            {currentView === "res_groups" && (
              <OfficialGroupsResults groupsData={groupsData} lang={lang} />
            )}
            {/* 👇 AQUÍ VA EL NUEVO COMPONENTE DE RESULTADOS OFICIALES 👇 */}
            {currentView === "res_finals" && (
              <OfficialKnockoutResults
                groupsData={groupsData}
                officialWinners={officialWinners || {}} // 👈 ¡CONECTADO!
                officialScores={officialScores || []} // 👈 ¡CONECTADO!
                lang={lang}
              />
            )}
          </div>
        )}
      </div>

      {currentView === "pred_groups" && !isLocked && (
        <FloatingProgress
          current={progress}
          total={totalMatches}
          isVisible={showFloating}
          lang={lang}
        />
      )}

      {showWinnerModal && winnerTeam && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.4)] animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              ✕
            </button>
            <div className="text-6xl mb-4 drop-shadow-lg">🏆</div>
            <h2 className="text-amber-400 font-black text-2xl tracking-tighter mb-2 italic">
              {t.bracketChampionTitle}
            </h2>
            <div className="bg-white/5 rounded-2xl py-6 border border-white/10 mb-6 flex flex-col items-center gap-3">
              {getFlagUrl(winnerTeam.flag) && (
                <img
                  src={getFlagUrl(winnerTeam.flag)!}
                  alt={winnerTeam.name}
                  className="w-24 h-16 object-cover rounded-lg shadow-lg border border-white/20"
                />
              )}
              <p className="text-white text-3xl font-bold uppercase tracking-widest">
                {lang === "en"
                  ? winnerTeam.name_en || winnerTeam.name_es || winnerTeam.name
                  : winnerTeam.name_es}
              </p>
            </div>
            <button
              onClick={() => setShowWinnerModal(false)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              {t.bracketChampionBtn}
            </button>
          </div>
        </div>
      )}

      <SystemAlerts
        modalType={systemModal}
        closeModal={closeSystemModal}
        confirmRefresh={confirmRefresh}
        proceedWithLogout={proceedWithLogout}
        lang={lang}
      />
    </main>
  );
};
