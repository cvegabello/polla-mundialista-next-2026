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
import { SubmitGroupModal } from "@/components/predictions/SubmitGroupModal";
import { FanNavigation } from "@/components/fan/header/FanNavigation";
import { VarReportModal } from "@/components/fan/reportes/VarReportModal";
import { SubmitZone } from "@/components/fan/header/SubmitZone";
import { AppFooter } from "@/components/shared/AppFooter";

import {
  R32_MATCHUPS,
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
  const [fetchedChampPts, setFetchedChampPts] = useState(0); // 🚀 NUEVO ESTADO: Los puntos rescatados del VAR

  useEffect(() => {
    setIsMounted(true);

    // 🚀 TÁCTICA DE RECUPERACIÓN: Si el componente padre no mandó los puntos, los extraemos del mismísimo VAR
    const fetchExtraPoints = async () => {
      if (!userSession?.id) return;
      try {
        const { getVarReportDataAction } =
          await import("@/lib/actions/fan-actions");
        const result = await getVarReportDataAction(userSession.id);

        if (result.success && result.data?.participants) {
          const myData = result.data.participants.find(
            (p: any) => p.id === userSession.id,
          );
          if (myData && myData.champPts) {
            setFetchedChampPts(myData.champPts);
          }
        }
      } catch (error) {
        console.error("Error trayendo puntos del campeón:", error);
      }
    };

    if (!userSession?.champPts && !userSession?.champ_pts) {
      fetchExtraPoints();
    }
  }, [userSession?.id, userSession?.champPts, userSession?.champ_pts]);

  const t = DICTIONARY[lang];

  // 🏆 ESTADOS PARA EL MODAL DE 16AVOS
  const [isKnockoutModalOpen, setIsKnockoutModalOpen] = useState(false);
  const [modalTeams, setModalTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // 🚀 NUEVA VERSIÓN: Valida vacíos y filtra solo a los clasificados desde BD pura
  const handleOpenKnockoutModal = async (phase: string, matchIds: any[]) => {
    // 1. VALIDACIÓN: ¿Están todos los partidos llenos?
    if (!validateKnockoutPhase(phase, matchIds)) return;

    // 2. Si pasó la aduana, abrimos el modal
    setIsKnockoutModalOpen(true);

    if (modalTeams.length === 0) {
      setIsLoadingTeams(true);
      try {
        const { getAllTeamsAction } = await import("@/lib/actions/fan-actions");
        const data = await getAllTeamsAction();

        // 3. 🎯 FILTRO DE CLASIFICADOS (Lee directo de BD a través de R32_MATCHUPS):
        const qualifiedIds = new Set();
        R32_MATCHUPS.forEach((m: any) => {
          const pId = getPhysicalMatchId(m.id);
          const pred = safePredictions?.find(
            (p) =>
              p.match_id?.toString() === pId?.toString() ||
              p.match_id?.toString() === m.id?.toString(),
          );
          if (pred?.predicted_home_team)
            qualifiedIds.add(pred.predicted_home_team);
          if (pred?.predicted_away_team)
            qualifiedIds.add(pred.predicted_away_team);
        });

        const filteredTeams =
          qualifiedIds.size > 0
            ? data.filter((t: any) => qualifiedIds.has(t.id))
            : data;

        setModalTeams(filteredTeams || []);
      } catch (error) {
        console.error("Error cargando equipos:", error);
      } finally {
        setIsLoadingTeams(false);
      }
    }
  };

  const [winnerTeam, setWinnerTeam] = useState<any>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);

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
    validateKnockoutPhase,
    isSubmitting,
    hasSubmitted,
    handlePredictionChange,
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
  } = useFanDashboardLogic(safePredictions, userSession?.id, safeGroups, lang);

  const getPhysicalMatchId = (matchId: string | number) => {
    if (!officialScores) return matchId;
    const match = officialScores.find(
      (m) =>
        m.match_number?.toString() === matchId.toString() ||
        m.id?.toString() === matchId.toString(),
    );
    return match ? match.id : matchId;
  };

  const formatMatchDate = (dateString?: string) => {
    if (!dateString) return "";
    const locale = lang === "es" ? "es-ES" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Buscador de fechas en la programación oficial (Grupo FI)
  const getMatchDateFromSchedule = (matchId: string | number) => {
    const physicalId = getPhysicalMatchId(matchId);
    const fiGroup = safeGroups?.find((g: any) => g.id === "FI");
    const matchInfo = fiGroup?.matches?.find(
      (m: any) =>
        m.match_number?.toString() === physicalId?.toString() ||
        m.id?.toString() === physicalId?.toString(),
    );
    return matchInfo?.match_date;
  };

  // 1. Buscador de Equipos BLINDADO (Garantiza atrapar la letra del Grupo)
  const getTeamData = (teamId: string | null | undefined) => {
    if (!teamId) return null;

    // 1.1 Búsqueda estructurada perfecta
    for (const group of safeGroups) {
      if (group.id === "FI") continue;

      // Buscar dentro del arreglo de equipos del grupo
      if (group.teams) {
        const team = group.teams.find(
          (t: any) => t.id === teamId || t.team_id === teamId,
        );
        if (team) return { ...team, group: group.id };
      }

      // Buscar dentro de los partidos del grupo (por si acaso)
      if (group.matches) {
        for (const match of group.matches) {
          if (match.home?.id === teamId)
            return { ...match.home, group: group.id };
          if (match.away?.id === teamId)
            return { ...match.away, group: group.id };
        }
      }
    }

    // 1.2 Fallback profundo (Buscador de emergencia)
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
        if (Object.prototype.hasOwnProperty.call(obj, key))
          searchDeep(obj[key]);
      }
    };
    searchDeep(safeGroups);
    return foundTeam;
  };

  // 2. Traductor Mágico INTELIGENTE
  const getDisplaySeed = (seed: string, team: any) => {
    if (!seed) return "";

    // Detectamos si este espacio es para un Mejor Tercero
    const isThirdPlace =
      seed.includes("T_") || seed.includes("/") || seed.startsWith("3");

    // CASO A: El equipo YA ESTÁ CLASIFICADO y le atrapamos el grupo
    if (team && team.group) {
      const groupLetter = team.group
        .toString()
        .replace("Grupo ", "")
        .replace("Group ", "");
      if (isThirdPlace) {
        return `3${groupLetter}`; // Mágicamente se vuelve 3A, 3B, 3C...
      }
      return seed; // Si era el primero (1A), sigue siendo 1A
    }

    // CASO B: El equipo AÚN NO está clasificado (TBD)
    if (isThirdPlace) {
      return "3º"; // Mostramos un "3º" elegante en lugar del código raro T_X
    }

    return seed;
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

  // 👇 EL ARREGLO MÁGICO 2.0: Sumamos los puntos del componente papá, o si no los mandó, los que rescatamos del VAR
  const champPoints =
    userSession?.champPts || userSession?.champ_pts || fetchedChampPts || 0;
  const calculatedTotalPoints = matchPoints + bonusPoints + champPoints;

  return (
    <main className="min-h-screen transition-colors duration-300 bg-transparent dark:bg-transparent relative pt-16 md:pl-16 pb-20 overflow-x-hidden">
      <StarBackground />

      {/* 🚀 NUESTRO NUEVO SÚPER MENÚ (TOPBAR + SIDEBAR) */}
      <FanNavigation
        lang={lang}
        currentView={currentView}
        onViewChange={setCurrentView}
        username={headerSession?.username || "Fan"}
        pollaName={headerSession?.polla_name}
        pollaId={headerSession?.polla_id}
        points={calculatedTotalPoints}
        submissionDate={headerSession?.submission_date}
        hasUnsavedChanges={hasUnsavedChanges}
        onManualSave={handleManualSave}
        onRefresh={handleRefresh}
        onLogout={() => handleLogoutAttempt(handleInternalLogout)}
        onOpenVar={() => setIsVarModalOpen(true)}
      />

      {/* ZONA DE CONTENIDO PRINCIPAL */}
      <div className="relative z-10 px-4 pt-6">
        {/* TÍTULO PRINCIPAL EN LA PANTALLA */}
        <div className="mb-6 mt-2 text-center">
          <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-orange-600 dark:from-white dark:to-cyan-200 drop-shadow-sm tracking-tighter">
            {currentView === "pred_groups"
              ? t.viewPredGroups
              : currentView === "pred_finals"
                ? t.viewPredFinals
                : currentView === "res_groups"
                  ? t.viewResGroups
                  : t.viewResFinals}
          </h1>
          <div className="h-1 w-16 mx-auto bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mt-2 opacity-60"></div>
        </div>

        {/* LA ZONA DE ENVÍO DE PRONÓSTICOS */}
        {currentView === "pred_groups" && (
          <SubmitZone
            lang={lang}
            isSubmitted={!!headerSession?.submission_date}
            isComplete={progress >= totalMatches}
            progress={progress}
            total={totalMatches}
            hasUnsavedChanges={hasUnsavedChanges}
            onSubmit={(championId) => handleSubmit("groups", [], championId)}
            isSubmitAllowed={isGroupSubmitAllowed}
          />
        )}

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
                {/* 🚀 ELIMINAMOS EL isLoadingBracket - Carga Inmediata */}
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
                  {/* 16AVOS LECTURA PURA DESDE LA DB */}
                  <PhaseColumn
                    title={t.bracketPhaseR32Full}
                    isActive={
                      safeConfig?.allow_r32 && !userSession?.sub_date_r32
                    }
                    isSubmitted={!!userSession?.sub_date_r32}
                    lang={lang}
                    showFloating={showFloating}
                    onAction={() => {
                      const matchIds = R32_MATCHUPS.map((m: any) =>
                        getPhysicalMatchId(m.id),
                      );
                      handleOpenKnockoutModal("r32", matchIds);
                    }}
                  >
                    {R32_MATCHUPS.map((match, idx) => {
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

                      const dbHome =
                        getTeamData(prediction?.predicted_home_team) || {};
                      const dbAway =
                        getTeamData(prediction?.predicted_away_team) || {};

                      return (
                        <BracketMatchCard
                          key={match.id}
                          matchId={match.id}
                          matchCode={
                            getMatchDateFromSchedule(match.id)
                              ? `M${match.id} • ${formatMatchDate(getMatchDateFromSchedule(match.id))}`
                              : `M${match.id}`
                          }
                          isLocked={!!userSession?.sub_date_r32}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 2 !== 0
                              ? { marginTop: "-8px" }
                              : { marginTop: "15px" }
                          }
                          homeTeam={{
                            id: dbHome.id || null,
                            seed: getDisplaySeed(match.h, dbHome), // 👈 LA MAGIA AQUÍ CON dbHome
                            name: dbHome.name_es
                              ? lang === "en"
                                ? dbHome.name_en || dbHome.name_es
                                : dbHome.name_es
                              : t.bracketTBD,
                            name_es: dbHome.name_es,
                            name_en: dbHome.name_en,
                            flag: dbHome.flag_code || dbHome.flag || null,
                            group: dbHome.group || null,
                          }}
                          awayTeam={{
                            id: dbAway.id || null,
                            seed: getDisplaySeed(match.a, dbAway), // 👈 Y AQUÍ CON dbAway
                            name: dbAway.name_es
                              ? lang === "en"
                                ? dbAway.name_en || dbAway.name_es
                                : dbAway.name_es
                              : t.bracketTBD,
                            name_es: dbAway.name_es,
                            name_en: dbAway.name_en,
                            flag: dbAway.flag_code || dbAway.flag || null,
                            group: dbAway.group || null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={
                            officialScoreObj
                              ? prediction?.points_won
                              : undefined
                          }
                          pointsCondition={
                            officialScoreObj
                              ? prediction?.points_condition
                              : undefined
                          }
                          officialScore={officialScoreObj}
                        />
                      );
                    })}
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
                    onAction={() => {
                      const matchIds = R16_MATCHUPS.map((m) =>
                        getPhysicalMatchId(m.id),
                      );
                      if (validateKnockoutPhase("r16", matchIds)) {
                        handleSubmit("r16", matchIds);
                      }
                    }}
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
                          matchCode={
                            getMatchDateFromSchedule(match.id)
                              ? `M${match.id} • ${formatMatchDate(getMatchDateFromSchedule(match.id))}`
                              : `M${match.id}`
                          }
                          isLocked={!!userSession?.sub_date_r16}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "185px" }
                              : { marginTop: "110px" }
                          }
                          homeTeam={{
                            id: finalHome?.id,
                            seed: match.h,
                            name: finalHome
                              ? finalHome.name_es || finalHome.name
                              : t.bracketTBD,
                            name_es: finalHome?.name_es,
                            name_en: finalHome?.name_en,
                            flag: finalHome
                              ? finalHome.flag_code || finalHome.flag
                              : null,
                          }}
                          awayTeam={{
                            id: finalAway?.id,
                            seed: match.a,
                            name: finalAway
                              ? finalAway.name_es || finalAway.name
                              : t.bracketTBD,
                            name_es: finalAway?.name_es,
                            name_en: finalAway?.name_en,
                            flag: finalAway
                              ? finalAway.flag_code || finalAway.flag
                              : null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={
                            officialScoreObj
                              ? prediction?.points_won
                              : undefined
                          }
                          pointsCondition={
                            officialScoreObj
                              ? prediction?.points_condition
                              : undefined
                          }
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
                    onAction={() => {
                      const matchIds = QF_MATCHUPS.map((m) =>
                        getPhysicalMatchId(m.id),
                      );
                      if (validateKnockoutPhase("qf", matchIds)) {
                        handleSubmit("qf", matchIds);
                      }
                    }}
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
                          matchCode={
                            getMatchDateFromSchedule(match.id)
                              ? `M${match.id} • ${formatMatchDate(getMatchDateFromSchedule(match.id))}`
                              : `M${match.id}`
                          }
                          isLocked={!!userSession?.sub_date_qf}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "550px" }
                              : { marginTop: "296px" }
                          }
                          homeTeam={{
                            id: finalHome?.id,
                            seed: match.h,
                            name: finalHome
                              ? finalHome.name_es || finalHome.name
                              : t.bracketTBD,
                            name_es: finalHome?.name_es,
                            name_en: finalHome?.name_en,
                            flag: finalHome
                              ? finalHome.flag_code || finalHome.flag
                              : null,
                          }}
                          awayTeam={{
                            id: finalAway?.id,
                            seed: match.a,
                            name: finalAway
                              ? finalAway.name_es || finalAway.name
                              : t.bracketTBD,
                            name_es: finalAway?.name_es,
                            name_en: finalAway?.name_en,
                            flag: finalAway
                              ? finalAway.flag_code || finalAway.flag
                              : null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={
                            officialScoreObj
                              ? prediction?.points_won
                              : undefined
                          }
                          pointsCondition={
                            officialScoreObj
                              ? prediction?.points_condition
                              : undefined
                          }
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
                    onAction={() => {
                      const matchIds = SF_MATCHUPS.map((m) =>
                        getPhysicalMatchId(m.id),
                      );
                      if (validateKnockoutPhase("sf", matchIds)) {
                        handleSubmit("sf", matchIds);
                      }
                    }}
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
                          matchCode={
                            getMatchDateFromSchedule(match.id)
                              ? `M${match.id} • ${formatMatchDate(getMatchDateFromSchedule(match.id))}`
                              : `M${match.id}`
                          }
                          isLocked={!!userSession?.sub_date_sf}
                          lang={lang}
                          onAdvanceTeam={handleAdvanceTeam}
                          style={
                            idx % 10 !== 0
                              ? { marginTop: "550px" }
                              : { marginTop: "650px" }
                          }
                          homeTeam={{
                            id: finalHome?.id,
                            seed: match.h,
                            name: finalHome
                              ? finalHome.name_es || finalHome.name
                              : t.bracketTBD,
                            name_es: finalHome?.name_es,
                            name_en: finalHome?.name_en,
                            flag: finalHome
                              ? finalHome.flag_code || finalHome.flag
                              : null,
                          }}
                          awayTeam={{
                            id: finalAway?.id,
                            seed: match.a,
                            name: finalAway
                              ? finalAway.name_es || finalAway.name
                              : t.bracketTBD,
                            name_es: finalAway?.name_es,
                            name_en: finalAway?.name_en,
                            flag: finalAway
                              ? finalAway.flag_code || finalAway.flag
                              : null,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={
                            officialScoreObj
                              ? prediction?.points_won
                              : undefined
                          }
                          pointsCondition={
                            officialScoreObj
                              ? prediction?.points_condition
                              : undefined
                          }
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
                    onAction={() => {
                      const matchIds = F_MATCHUPS.map((m) =>
                        getPhysicalMatchId(m.id),
                      );
                      if (validateKnockoutPhase("f", matchIds)) {
                        handleSubmit("f", matchIds);
                      }
                    }}
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
                          matchCode={
                            getMatchDateFromSchedule(match.id)
                              ? `M${match.id} • ${formatMatchDate(getMatchDateFromSchedule(match.id))}`
                              : `M${match.id}`
                          }
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
                            name: finalHome?.id
                              ? lang === "en"
                                ? finalHome.name_en || finalHome.name_es
                                : finalHome.name_es
                              : t.bracketTBD,
                          }}
                          awayTeam={{
                            ...finalAway,
                            seed: match.a,
                            name: finalAway?.id
                              ? lang === "en"
                                ? finalAway.name_en || finalAway.name_es
                                : finalAway.name_es
                              : t.bracketTBD,
                          }}
                          prediction={prediction}
                          onSavePrediction={handleSaveKnockoutPrediction}
                          pointsWon={
                            officialScoreObj
                              ? prediction?.points_won
                              : undefined
                          }
                          pointsCondition={
                            officialScoreObj
                              ? prediction?.points_condition
                              : undefined
                          }
                          officialScore={officialScoreObj}
                        />
                      );
                    })}
                  </PhaseColumn>
                </BracketContainer>
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
                {getFlagUrl(winnerTeam.flag_code || winnerTeam.flag) && (
                  <img
                    src={getFlagUrl(winnerTeam.flag_code || winnerTeam.flag)!}
                    alt={winnerTeam.name}
                    className="w-24 h-16 object-cover rounded-lg shadow-lg border border-white/20"
                  />
                )}
                <p className="text-white text-3xl font-bold uppercase tracking-widest">
                  {lang === "en"
                    ? winnerTeam.name_en ||
                      winnerTeam.name_es ||
                      winnerTeam.name
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
      </div>
      {/* 🏆 MODAL DE CAMPEÓN PARA 16AVOS */}
      <SubmitGroupModal
        isOpen={isKnockoutModalOpen}
        onClose={() => setIsKnockoutModalOpen(false)}
        teams={modalTeams}
        lang={lang}
        isLoading={isSubmitting || isLoadingTeams}
        onConfirm={(championId) => {
          handleSubmit(
            "r32",
            R32_MATCHUPS.map((m) => getPhysicalMatchId(m.id)), // 🚀 Ahora usamos los R32 puros
            championId,
          );
          setIsKnockoutModalOpen(false);
        }}
      />

      <VarReportModal
        isOpen={isVarModalOpen}
        onClose={() => setIsVarModalOpen(false)}
        lang={lang}
      />

      <SystemAlerts
        modalType={systemModal}
        closeModal={closeSystemModal}
        confirmRefresh={confirmRefresh}
        proceedWithLogout={proceedWithLogout}
        lang={lang}
      />
      <AppFooter lang={lang} />
    </main>
  );
};
