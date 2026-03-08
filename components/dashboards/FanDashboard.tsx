"use client";

import React, { useState, useEffect } from "react";
import { StarBackground } from "@/components/shared/StarBackground";
import { GroupCard } from "@/components/groups/GroupCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import confetti from "canvas-confetti";
import { resolveBracketMatches } from "@/utils/bracket-resolver";

import { FanHeader } from "@/components/fan/header/FanHeader";
import { FloatingProgress } from "@/components/fan/FloatingProgress";
import { BracketContainer } from "@/components/bracket/BracketContainer";
import { PhaseColumn } from "@/components/bracket/PhaseColumn";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";
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
  userPredictions?: any[]; // 👈 Opcional por seguridad
  officialScores?: any[];
  officialWinners?: Record<string, any>;
  loadingData: boolean;
  lang: Language;
  userBonuses?: any[];
  globalConfig?: any;
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
  userPredictions = [],
  officialScores,
  officialWinners,
  loadingData,
  lang,
  userBonuses = [],
  globalConfig = {},
}: FanDashboardProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = DICTIONARY[lang];
  const [winnerTeam, setWinnerTeam] = useState<any>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // 🛡️ SEGUROS DE VIDA ANTI-CRASHEOS
  const safePredictions = userPredictions || [];
  const safeBonuses = userBonuses || [];
  const safeGroups = groupsData || [];
  const safeConfig = globalConfig || {};

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
  } = useFanDashboardLogic(safePredictions, userSession?.id, safeGroups);

  const handleFinalAdvance = (
    matchId: string | number,
    winner: any,
    isFinalMatch: boolean,
    isManualAction: boolean = false,
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

  // 🔥 LA LÓGICA DE CANDADOS ACTUALIZADA 🔥
  const isSubmissionLocked = !!userSession?.submission_date || hasSubmitted;

  // 1. Las cajitas SOLO se bloquean si el usuario ya envió su polla oficial.
  const isGroupInputsLocked = isSubmissionLocked;

  // 2. El botón de envío se bloquea si el usuario ya envió, O si el SuperAdmin cerró la fase.
  const isGroupSubmitAllowed = safeConfig.allow_groups && !isSubmissionLocked;

  const headerSession = isSubmissionLocked
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

  if (!isMounted) return <main className="min-h-screen bg-black"></main>;

  const matchPoints = safePredictions.reduce(
    (acc, pred) => acc + (pred.points_won || 0),
    0,
  );
  const bonusPoints = safeBonuses.reduce(
    (acc, bonus) => acc + (bonus.points_won || 0),
    0,
  );
  const calculatedTotalPoints = matchPoints + bonusPoints;

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
        totalPoints={calculatedTotalPoints}
        // 👇 Le pasamos la llave al Header para que sepa si prender el botón o no
        isSubmitAllowed={isGroupSubmitAllowed}
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
              {safeGroups
                ?.filter((g) => g.id !== "FI")
                .map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    lang={lang}
                    initialPredictions={safePredictions}
                    onPredictionChange={handlePredictionChange}
                    // 👇 Las cajitas obedecen ÚNICAMENTE al hecho de si el usuario ya envió todo
                    isLocked={isGroupInputsLocked}
                    onGroupDirty={handleGroupDataChange}
                    groupBonus={safeBonuses.find(
                      (b) => b.bonus_type === `GROUP_${group.id}`,
                    )}
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
                    isActive={safeConfig?.allow_r32 && !isSubmissionLocked}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={handleSubmit}
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
                          prediction={safePredictions?.find(
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

                  <PhaseColumn
                    title={t.bracketPhaseR16Full}
                    isActive={safeConfig?.allow_r16 && !isSubmissionLocked}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={handleSubmit}
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
                          prediction={safePredictions?.find(
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
                    isActive={safeConfig?.allow_qf && !isSubmissionLocked}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={handleSubmit}
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
                          prediction={safePredictions?.find(
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
                    isActive={safeConfig?.allow_sf && !isSubmissionLocked}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={handleSubmit}
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
                          prediction={safePredictions?.find(
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
                    isActive={safeConfig?.allow_f && !isSubmissionLocked}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={handleSubmit}
                  >
                    {resolveBracketMatches(
                      safeGroups,
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
                              ? { marginTop: "60px" }
                              : { marginTop: "15px" }
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
                          prediction={safePredictions?.find(
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
              <OfficialGroupsResults groupsData={safeGroups} lang={lang} />
            )}
            {currentView === "res_finals" && (
              <OfficialKnockoutResults
                groupsData={safeGroups}
                officialWinners={officialWinners || {}}
                officialScores={officialScores || []}
                lang={lang}
              />
            )}
          </div>
        )}
      </div>

      {/* 👇 La barra de progreso flota sin importar el candado del SuperAdmin */}
      {currentView === "pred_groups" && !isSubmissionLocked && (
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
