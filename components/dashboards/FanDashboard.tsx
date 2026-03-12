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
  userPredictions?: any[];
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

  const getPhysicalMatchId = (matchId: string | number) => {
    if (!officialScores) return matchId;
    const match = officialScores.find(
      (m) =>
        m.match_number?.toString() === matchId.toString() ||
        m.id?.toString() === matchId.toString(),
    );
    return match ? match.id : matchId;
  };

  const getTeamData = (teamId: string | null | undefined) => {
    if (!teamId) return null;
    let foundTeam: any = null;
    const searchDeep = (obj: any) => {
      if (foundTeam) return;
      if (!obj || typeof obj !== "object") return;
      if (
        obj.id === teamId ||
        obj.team_id === teamId ||
        obj.teamId === teamId
      ) {
        if (obj.name || obj.name_es || obj.flag || obj.name_en) {
          foundTeam = obj;
          return;
        }
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          searchDeep(obj[key]);
        }
      }
    };
    searchDeep(safeGroups);
    return foundTeam;
  };

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
    }
  };

  const isSubmissionLocked = !!userSession?.sub_date_groups || hasSubmitted;
  const isGroupInputsLocked = isSubmissionLocked;
  const isGroupSubmitAllowed = safeConfig.allow_groups && !isSubmissionLocked;

  const headerSession = isSubmissionLocked
    ? {
        ...userSession,
        sub_date_groups:
          userSession?.sub_date_groups || new Date().toISOString(),
        submission_date:
          userSession?.sub_date_groups || new Date().toISOString(),
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
                  {/* 16AVOS */}
                  <PhaseColumn
                    title={t.bracketPhaseR32Full}
                    isActive={
                      safeConfig?.allow_r32 && !userSession?.sub_date_r32
                    }
                    isSubmitted={!!userSession?.sub_date_r32}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={() =>
                      handleSubmit(
                        "r32",
                        bracketMatches.map((m) => getPhysicalMatchId(m.id)),
                      )
                    }
                  >
                    {bracketMatches.length > 0 ? (
                      bracketMatches.map((match, idx) => {
                        const physicalId = getPhysicalMatchId(match.id);
                        const prediction = safePredictions?.find(
                          (p) =>
                            p.match_id?.toString() === physicalId?.toString() ||
                            p.match_id?.toString() === match.id?.toString(),
                        );

                        // 👇 LECTOR DEL MARCADOR OFICIAL
                        const offScore = officialScores?.find(
                          (m) =>
                            m.match_number?.toString() ===
                              physicalId?.toString() ||
                            m.id?.toString() === physicalId?.toString(),
                        );
                        const officialScoreObj =
                          offScore &&
                          offScore.home_score !== null &&
                          offScore.away_score !== null
                            ? {
                                home: offScore.home_score,
                                away: offScore.away_score,
                              }
                            : undefined;

                        const dbHome = getTeamData(
                          prediction?.predicted_home_team,
                        );
                        const dbAway = getTeamData(
                          prediction?.predicted_away_team,
                        );
                        const finalHome = dbHome || match.home;
                        const finalAway = dbAway || match.away;

                        return (
                          <BracketMatchCard
                            key={match.id}
                            matchId={match.id}
                            matchCode={`M${match.id}`}
                            isLocked={!!userSession?.sub_date_r32}
                            lang={lang}
                            onAdvanceTeam={handleAdvanceTeam}
                            style={
                              idx % 2 !== 0
                                ? { marginTop: "-8px" }
                                : { marginTop: "15px" }
                            }
                            homeTeam={{
                              id: finalHome?.id,
                              seed: match.h,
                              name:
                                finalHome?.name_es ||
                                (prediction?.predicted_home_team
                                  ? "✅ BD LISTA"
                                  : match.h),
                              name_es: finalHome?.name_es,
                              name_en: finalHome?.name_en,
                              flag: finalHome?.flag,
                              group: finalHome?.group,
                            }}
                            awayTeam={{
                              id: finalAway?.id,
                              seed: match.a,
                              name:
                                finalAway?.name_es ||
                                (prediction?.predicted_away_team
                                  ? "✅ BD LISTA"
                                  : match.a),
                              name_es: finalAway?.name_es,
                              name_en: finalAway?.name_en,
                              flag: finalAway?.flag,
                              group: finalAway?.group,
                            }}
                            prediction={prediction}
                            onSavePrediction={handleSaveKnockoutPrediction}
                            // 👇 ENVIAMOS PUNTOS Y OFICIAL
                            pointsWon={prediction?.points_won}
                            pointsCondition={prediction?.points_condition}
                            officialScore={officialScoreObj}
                          />
                        );
                      })
                    ) : (
                      <div className="text-white/50 text-xs p-4 bg-slate-900/50 rounded-lg text-center border border-white/10">
                        {t.bracketCompleteGroups}
                      </div>
                    )}
                  </PhaseColumn>

                  {/* OCTAVOS */}
                  <PhaseColumn
                    title={t.bracketPhaseR16Full}
                    isActive={
                      safeConfig?.allow_r16 && !userSession?.sub_date_r16
                    }
                    isSubmitted={!!userSession?.sub_date_r16}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={() =>
                      handleSubmit(
                        "r16",
                        R16_MATCHUPS.map((m) => getPhysicalMatchId(m.id)),
                      )
                    }
                  >
                    {R16_MATCHUPS.map((match, idx) => {
                      const physicalId = getPhysicalMatchId(match.id);
                      const prediction = safePredictions?.find(
                        (p) =>
                          p.match_id?.toString() === physicalId?.toString() ||
                          p.match_id?.toString() === match.id?.toString(),
                      );

                      const offScore = officialScores?.find(
                        (m) =>
                          m.match_number?.toString() ===
                            physicalId?.toString() ||
                          m.id?.toString() === physicalId?.toString(),
                      );
                      const officialScoreObj =
                        offScore &&
                        offScore.home_score !== null &&
                        offScore.away_score !== null
                          ? {
                              home: offScore.home_score,
                              away: offScore.away_score,
                            }
                          : undefined;

                      const dbHome = getTeamData(
                        prediction?.predicted_home_team,
                      );
                      const dbAway = getTeamData(
                        prediction?.predicted_away_team,
                      );
                      const simHome = knockoutWinners[match.h.replace("W", "")];
                      const simAway = knockoutWinners[match.a.replace("W", "")];

                      const finalHome = dbHome || simHome;
                      const finalAway = dbAway || simAway;

                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          isLocked={!!userSession?.sub_date_r16}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "125px" }
                              : { marginTop: "65px" }
                          }
                          homeTeam={{
                            id: finalHome?.id,
                            seed: match.h,
                            name: finalHome
                              ? finalHome.name_es || finalHome.name
                              : t.bracketTBD,
                            name_es: finalHome?.name_es,
                            name_en: finalHome?.name_en,
                            flag: finalHome ? finalHome.flag : null,
                          }}
                          awayTeam={{
                            id: finalAway?.id,
                            seed: match.a,
                            name: finalAway
                              ? finalAway.name_es || finalAway.name
                              : t.bracketTBD,
                            name_es: finalAway?.name_es,
                            name_en: finalAway?.name_en,
                            flag: finalAway ? finalAway.flag : null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={prediction?.points_won}
                          pointsCondition={prediction?.points_condition}
                          officialScore={officialScoreObj}
                        />
                      );
                    })}
                  </PhaseColumn>

                  {/* CUARTOS */}
                  <PhaseColumn
                    title={t.bracketPhaseQFFull}
                    isActive={safeConfig?.allow_qf && !userSession?.sub_date_qf}
                    isSubmitted={!!userSession?.sub_date_qf}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={() =>
                      handleSubmit(
                        "qf",
                        QF_MATCHUPS.map((m) => getPhysicalMatchId(m.id)),
                      )
                    }
                  >
                    {QF_MATCHUPS.map((match, idx) => {
                      const physicalId = getPhysicalMatchId(match.id);
                      const prediction = safePredictions?.find(
                        (p) =>
                          p.match_id?.toString() === physicalId?.toString() ||
                          p.match_id?.toString() === match.id?.toString(),
                      );

                      const offScore = officialScores?.find(
                        (m) =>
                          m.match_number?.toString() ===
                            physicalId?.toString() ||
                          m.id?.toString() === physicalId?.toString(),
                      );
                      const officialScoreObj =
                        offScore &&
                        offScore.home_score !== null &&
                        offScore.away_score !== null
                          ? {
                              home: offScore.home_score,
                              away: offScore.away_score,
                            }
                          : undefined;

                      const dbHome = getTeamData(
                        prediction?.predicted_home_team,
                      );
                      const dbAway = getTeamData(
                        prediction?.predicted_away_team,
                      );
                      const simHome = knockoutWinners[match.h.replace("W", "")];
                      const simAway = knockoutWinners[match.a.replace("W", "")];

                      const finalHome = dbHome || simHome;
                      const finalAway = dbAway || simAway;

                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          isLocked={!!userSession?.sub_date_qf}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "360px" }
                              : { marginTop: "200px" }
                          }
                          homeTeam={{
                            id: finalHome?.id,
                            seed: match.h,
                            name: finalHome
                              ? finalHome.name_es || finalHome.name
                              : t.bracketTBD,
                            name_es: finalHome?.name_es,
                            name_en: finalHome?.name_en,
                            flag: finalHome ? finalHome.flag : null,
                          }}
                          awayTeam={{
                            id: finalAway?.id,
                            seed: match.a,
                            name: finalAway
                              ? finalAway.name_es || finalAway.name
                              : t.bracketTBD,
                            name_es: finalAway?.name_es,
                            name_en: finalAway?.name_en,
                            flag: finalAway ? finalAway.flag : null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={prediction?.points_won}
                          pointsCondition={prediction?.points_condition}
                          officialScore={officialScoreObj}
                        />
                      );
                    })}
                  </PhaseColumn>

                  {/* SEMIS */}
                  <PhaseColumn
                    title={t.bracketPhaseSFFull}
                    isActive={safeConfig?.allow_sf && !userSession?.sub_date_sf}
                    isSubmitted={!!userSession?.sub_date_sf}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={() =>
                      handleSubmit(
                        "sf",
                        SF_MATCHUPS.map((m) => getPhysicalMatchId(m.id)),
                      )
                    }
                  >
                    {SF_MATCHUPS.map((match, idx) => {
                      const physicalId = getPhysicalMatchId(match.id);
                      const prediction = safePredictions?.find(
                        (p) =>
                          p.match_id?.toString() === physicalId?.toString() ||
                          p.match_id?.toString() === match.id?.toString(),
                      );

                      const offScore = officialScores?.find(
                        (m) =>
                          m.match_number?.toString() ===
                            physicalId?.toString() ||
                          m.id?.toString() === physicalId?.toString(),
                      );
                      const officialScoreObj =
                        offScore &&
                        offScore.home_score !== null &&
                        offScore.away_score !== null
                          ? {
                              home: offScore.home_score,
                              away: offScore.away_score,
                            }
                          : undefined;

                      const dbHome = getTeamData(
                        prediction?.predicted_home_team,
                      );
                      const dbAway = getTeamData(
                        prediction?.predicted_away_team,
                      );
                      const simHome = knockoutWinners[match.h.replace("W", "")];
                      const simAway = knockoutWinners[match.a.replace("W", "")];

                      const finalHome = dbHome || simHome;
                      const finalAway = dbAway || simAway;

                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          isLocked={!!userSession?.sub_date_sf}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "850px" }
                              : { marginTop: "450px" }
                          }
                          homeTeam={{
                            id: finalHome?.id,
                            seed: match.h,
                            name: finalHome
                              ? finalHome.name_es || finalHome.name
                              : t.bracketTBD,
                            name_es: finalHome?.name_es,
                            name_en: finalHome?.name_en,
                            flag: finalHome ? finalHome.flag : null,
                          }}
                          awayTeam={{
                            id: finalAway?.id,
                            seed: match.a,
                            name: finalAway
                              ? finalAway.name_es || finalAway.name
                              : t.bracketTBD,
                            name_es: finalAway?.name_es,
                            name_en: finalAway?.name_en,
                            flag: finalAway ? finalAway.flag : null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={prediction?.points_won}
                          pointsCondition={prediction?.points_condition}
                          officialScore={officialScoreObj}
                        />
                      );
                    })}
                  </PhaseColumn>

                  {/* FINAL */}
                  <PhaseColumn
                    title={t.bracketPhaseFTitle}
                    isActive={safeConfig?.allow_f && !userSession?.sub_date_f}
                    isSubmitted={!!userSession?.sub_date_f}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={() =>
                      handleSubmit(
                        "f",
                        F_MATCHUPS.map((m) => getPhysicalMatchId(m.id)),
                      )
                    }
                  >
                    {resolveBracketMatches(
                      safeGroups,
                      knockoutWinners,
                      F_MATCHUPS,
                    ).map((match, idx) => {
                      const isFinal = idx === 0;
                      const physicalId = getPhysicalMatchId(match.id);
                      const prediction = safePredictions?.find(
                        (p) =>
                          p.match_id?.toString() === physicalId?.toString() ||
                          p.match_id?.toString() === match.id?.toString(),
                      );

                      const offScore = officialScores?.find(
                        (m) =>
                          m.match_number?.toString() ===
                            physicalId?.toString() ||
                          m.id?.toString() === physicalId?.toString(),
                      );
                      const officialScoreObj =
                        offScore &&
                        offScore.home_score !== null &&
                        offScore.away_score !== null
                          ? {
                              home: offScore.home_score,
                              away: offScore.away_score,
                            }
                          : undefined;

                      const dbHome = getTeamData(
                        prediction?.predicted_home_team,
                      );
                      const dbAway = getTeamData(
                        prediction?.predicted_away_team,
                      );
                      const finalHome = dbHome || match.home;
                      const finalAway = dbAway || match.away;

                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={`M${match.id}`}
                          isLocked={!!userSession?.sub_date_f}
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
                            ...finalHome,
                            seed: match.h,
                            name: finalHome.id
                              ? lang === "en"
                                ? finalHome.name_en || finalHome.name_es
                                : finalHome.name_es
                              : t.bracketTBD,
                          }}
                          awayTeam={{
                            ...finalAway,
                            seed: match.a,
                            name: finalAway.id
                              ? lang === "en"
                                ? finalAway.name_en || finalAway.name_es
                                : finalAway.name_es
                              : t.bracketTBD,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={prediction?.points_won}
                          pointsCondition={prediction?.points_condition}
                          officialScore={officialScoreObj}
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
          <div className="relative bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.4)]">
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
