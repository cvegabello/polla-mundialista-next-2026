"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getVarReportDataAction } from "@/lib/actions/fan-actions";
import { X, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface VarReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const VarReportModal = ({
  isOpen,
  onClose,
  lang,
}: VarReportModalProps) => {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"matrix" | "positions">("matrix");
  const [expandedView, setExpandedView] = useState<
    "none" | "matrix" | "positions"
  >("none");

  const t = DICTIONARY[lang];

  // 🕒 Extrae "YYYY-MM-DD" respetando la zona horaria del fan
  const getLocalYYYYMMDD = (dateObj?: string | Date) => {
    const d = dateObj ? new Date(dateObj) : new Date();
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayIso = getLocalYYYYMMDD();
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // 🚩 FUNCIÓN BANDERAS BLINDADA
  const getFlagUrl = (teamOrCode?: any) => {
    if (!teamOrCode) return null;

    let code3 =
      typeof teamOrCode === "string"
        ? teamOrCode
        : teamOrCode.flag_code || teamOrCode.name_es;

    if (!code3 || typeof code3 !== "string") return null;

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
      inglaterra: "gb",
      england: "gb",
    };

    if (code3.includes("_rep_")) return null;

    const normalizedCode = code3.toLowerCase().substring(0, 3);
    const code2 =
      map[normalizedCode] ||
      map[code3.toLowerCase()] ||
      code3.slice(0, 2).toLowerCase();

    return `https://flagcdn.com/w80/${code2}.png`;
  };

  const loadData = useCallback(async (showMainLoader = true) => {
    if (showMainLoader) setLoading(true);
    else setIsRefreshing(true);

    const match = document.cookie.match(
      new RegExp("(^| )polla_session=([^;]+)"),
    );
    if (match) {
      try {
        let cookieValue = match[2];
        cookieValue = decodeURIComponent(cookieValue);
        if (cookieValue.startsWith("%"))
          cookieValue = decodeURIComponent(cookieValue);

        const session = JSON.parse(cookieValue);
        if (session?.id) {
          const result = await getVarReportDataAction(session.id);
          if (result.success) setData(result.data);
          else console.error("Error del servidor: " + result.error);
        }
      } catch (e) {
        console.error("Error parseando sesión", e);
      }
    }

    if (showMainLoader) setLoading(false);
    else setIsRefreshing(false);
  }, []);

  useEffect(() => {
    if (isOpen) loadData(true);
  }, [isOpen, loadData]);

  // 🛡️ Filtro de fechas
  const filteredMatches = useMemo(() => {
    if (!data?.matches) return [];
    if (selectedDate === "all") return data.matches;
    return data.matches.filter((m: any) => {
      if (!m.match_date) return false;
      const matchDateStr = getLocalYYYYMMDD(m.match_date);
      return matchDateStr === selectedDate;
    });
  }, [data?.matches, selectedDate]);

  // 🏆 Leaderboard de la derecha (Puntos totales Base)
  const leaderboard = useMemo(() => {
    if (!data?.participants || !data?.predictions) return [];

    const exactVal = data.scoreConfig?.exact_score ?? 5;
    const diffVal = data.scoreConfig?.goal_diff ?? 3;
    const winnerVal = data.scoreConfig?.winner_only ?? 1;

    const scores = data.participants.map((p: any) => {
      const userPreds = data.predictions.filter(
        (pred: any) => pred.user_id === p.id,
      );

      let matchPoints = 0;
      let exactPts = 0;
      let diffPts = 0;
      let winnerPts = 0;

      userPreds.forEach((pred: any) => {
        const pts = pred.points_won || 0;
        matchPoints += pts;
        if (pts === exactVal) exactPts += pts;
        else if (pts === diffVal) diffPts += pts;
        else if (pts === winnerVal) winnerPts += pts;
      });

      let bonusPoints = 0;
      let bonusGrp = 0;

      if (data.bonusPoints) {
        data.bonusPoints
          .filter((b: any) => b.user_id === p.id)
          .forEach((b: any) => {
            const pts = b.points_won || 0;
            bonusPoints += pts;
            if (b.bonus_type && b.bonus_type.includes("GROUP")) {
              bonusGrp += pts;
            }
          });
      }

      const champPts = p.champPts || 0;

      return {
        ...p,
        totalPoints: matchPoints + bonusPoints + champPts,
        exactPts,
        diffPts,
        winnerPts,
        bonusGrp,
        champPts,
      };
    });

    return scores.sort((a: any, b: any) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      const dateA = new Date(a.sub_date_groups || "9999-12-31").getTime();
      const dateB = new Date(b.sub_date_groups || "9999-12-31").getTime();
      return dateA - dateB;
    });
  }, [data]);

  // 🚀 CEREBRO UNIFICADO
  const sortedParticipants = useMemo(() => {
    if (selectedDate === "all") {
      return [...leaderboard];
    }

    return [...leaderboard].sort((a, b) => {
      const ptsA = filteredMatches.reduce((acc: number, m: any) => {
        const pred = data?.predictions?.find(
          (p: any) => p.user_id === a.id && p.match_id === m.id,
        );
        return acc + (pred?.points_won || 0);
      }, 0);

      const ptsB = filteredMatches.reduce((acc: number, m: any) => {
        const pred = data?.predictions?.find(
          (p: any) => p.user_id === b.id && p.match_id === m.id,
        );
        return acc + (pred?.points_won || 0);
      }, 0);

      if (ptsB !== ptsA) {
        return ptsB - ptsA;
      }

      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      const nameA = a.username ? a.username.toLowerCase() : "";
      const nameB = b.username ? b.username.toLowerCase() : "";
      return nameA.localeCompare(nameB);
    });
  }, [leaderboard, filteredMatches, selectedDate, data?.predictions]);

  const getPointsTag = (points: number | null, config: any) => {
    if (points === null || points === undefined)
      return <span className="text-gray-600 font-bold">-</span>;
    if (points === 0)
      return (
        <span className="text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded text-[10px] font-black border border-red-800 shadow-inner">
          ❌ 0
        </span>
      );

    const exactPts = config?.exact_score ?? 5;
    const diffPts = config?.goal_diff ?? 3;
    const winnerPts = config?.winner_only ?? 1;

    if (points === exactPts)
      return (
        <span className="text-green-400 bg-green-950/50 px-1.5 py-0.5 rounded text-[10px] font-black border border-green-800 shadow-inner">
          🎯 +{points}
        </span>
      );
    if (points === diffPts)
      return (
        <span className="text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded text-[10px] font-black border border-blue-800 shadow-inner">
          ⭐ +{points}
        </span>
      );
    if (points === winnerPts)
      return (
        <span className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded text-[10px] font-black border border-amber-800 shadow-inner">
          ✅ +{points}
        </span>
      );

    return (
      <span className="text-green-400 bg-green-950/50 px-1.5 py-0.5 rounded text-[10px] font-black border border-green-800 shadow-inner">
        +{points}
      </span>
    );
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return "--/--";
    const locale = lang === "es" ? "es-ES" : "en-US";
    return new Date(dateString)
      .toLocaleDateString(locale, { day: "numeric", month: "short" })
      .toUpperCase();
  };

  const formatHour = (dateString: string) => {
    if (!dateString) return "--:--";
    const locale = lang === "es" ? "es-ES" : "en-US";
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  const isMatrixExpanded = expandedView === "matrix";
  const isPositionsExpanded = expandedView === "positions";
  const isNoneExpanded = expandedView === "none";

  const matrixMobileClass =
    isMatrixExpanded || (isNoneExpanded && activeTab === "matrix")
      ? "flex flex-1 min-h-0"
      : "hidden";
  const matrixDesktopClass =
    isMatrixExpanded || isNoneExpanded ? "xl:flex" : "xl:hidden";
  const matrixSpanClass = isMatrixExpanded ? "xl:col-span-4" : "xl:col-span-3";

  const positionsMobileClass =
    isPositionsExpanded || (isNoneExpanded && activeTab === "positions")
      ? "flex flex-1 min-h-0"
      : "hidden";
  const positionsDesktopClass =
    isPositionsExpanded || isNoneExpanded ? "xl:flex" : "xl:hidden";
  const positionsSpanClass = isPositionsExpanded
    ? "xl:col-span-4"
    : "xl:col-span-1";

  const detailColClass = isPositionsExpanded
    ? "table-cell"
    : "hidden max-xl:landscape:table-cell";
  const expandedTextHeader = isPositionsExpanded ? "xl:text-xs xl:py-4" : "";
  const expandedTextData = isPositionsExpanded ? "xl:text-base xl:py-4" : "";
  const expandedTextTotal = isPositionsExpanded ? "xl:text-2xl" : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-[1600px] h-[90vh] bg-black border-2 border-orange-500 shadow-[0_0_50px_-10px_rgba(249,115,22,0.4)] rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 🏟️ IMAGEN DE FONDO REAL */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 blur-[2px] pointer-events-none z-0"
          style={{
            backgroundImage:
              "url('/images/FIFAWCup-26-Stadium-New-York-New-Jersey.avif')",
          }}
        />

        <div className="relative z-10 flex flex-col h-full w-full">
          {isNoneExpanded && (
            <div className="flex flex-col lg:flex-row lg:justify-between items-center p-4 pt-16 lg:p-5 lg:pt-5 border-b border-orange-600 bg-[#050200]/80 backdrop-blur-sm shrink-0 gap-4 lg:gap-0 relative z-10">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 tracking-tighter uppercase flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] whitespace-nowrap">
                  {t.varTitle}
                </h2>
                <p className="hidden lg:block text-xs text-orange-300 mt-0.5 tracking-widest uppercase font-semibold whitespace-nowrap">
                  {t.varSubtitle}
                </p>

                {data?.pollaName && (
                  <div className="mt-2 lg:hidden">
                    <span className="bg-[#1a0a00]/80 text-amber-500 border border-amber-600/50 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(249,115,22,0.3)] inline-block truncate max-w-[200px]">
                      🏆 {data.pollaName}
                    </span>
                  </div>
                )}
              </div>

              {data?.pollaName && (
                <div className="hidden lg:flex flex-1 justify-center px-4">
                  <span className="bg-gradient-to-r from-[#1a0a00]/80 to-black/80 text-amber-500 border border-amber-600/50 px-8 py-2 rounded-full text-sm font-black tracking-widest uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)] flex items-center gap-2">
                    🏆 {data.pollaName}
                  </span>
                </div>
              )}

              <div className="flex flex-nowrap justify-center items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center bg-black/80 backdrop-blur-sm border border-orange-600 rounded-lg overflow-hidden focus-within:border-orange-400 focus-within:shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all">
                  <span className="pl-2 sm:pl-3 text-orange-500 text-sm">
                    📅
                  </span>
                  <input
                    type="date"
                    value={selectedDate === "all" ? "" : selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white text-xs sm:text-sm font-bold block p-2 outline-none cursor-pointer w-[120px] sm:w-auto"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <button
                  onClick={() => setSelectedDate("all")}
                  className={`cursor-pointer text-xs sm:text-sm font-bold py-2 sm:py-2 px-3 sm:px-4 rounded-lg transition-all border whitespace-nowrap shrink-0 ${selectedDate === "all" ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-black/80 backdrop-blur-sm border-orange-700 text-orange-400 hover:bg-[#1a0a00] hover:border-orange-500"}`}
                >
                  {t.varAllDates}
                </button>
              </div>

              {/* 👇 AQUI TAMBIEN: Cambiamos md: por lg: para los botones flotantes 👇 */}
              <div className="absolute top-4 right-4 lg:static lg:top-auto lg:right-auto flex justify-end gap-2 shrink-0 lg:ml-4">
                <button
                  onClick={() => loadData(false)}
                  disabled={isRefreshing}
                  className="p-2 cursor-pointer bg-black/80 backdrop-blur-sm border border-orange-700 text-orange-500 hover:bg-orange-600 hover:text-white hover:border-orange-500 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t.varRefreshTooltip}
                >
                  <RefreshCw
                    size={20}
                    className={`stroke-[3] ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 cursor-pointer bg-black/80 backdrop-blur-sm border border-orange-700 text-orange-500 hover:bg-red-600 hover:text-white hover:border-red-500 rounded-lg transition-all shadow-sm"
                  title={t.varCloseTooltip}
                >
                  <X size={20} className="stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-3 sm:p-5 bg-transparent">
            {isNoneExpanded && (
              <div className="flex xl:hidden shrink-0 gap-3 mb-4 w-full px-1">
                <button
                  onClick={() => setActiveTab("matrix")}
                  className={`flex-1 py-3 text-[11px] sm:text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex justify-center items-center gap-2 border backdrop-blur-sm ${
                    activeTab === "matrix"
                      ? "bg-gradient-to-r from-orange-600/90 to-amber-500/90 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                      : "bg-[#0a0500]/80 border-orange-800 text-orange-500/80 hover:bg-[#1a0a00] hover:text-orange-400"
                  }`}
                >
                  📊 {t.varTabMatrix}
                </button>
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`flex-1 py-3 text-[11px] sm:text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex justify-center items-center gap-2 border backdrop-blur-sm ${
                    activeTab === "positions"
                      ? "bg-gradient-to-r from-orange-600/90 to-amber-500/90 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                      : "bg-[#0a0500]/80 border-orange-800 text-orange-500/80 hover:bg-[#1a0a00] hover:text-orange-400"
                  }`}
                >
                  🏆 {t.varTabPositions}
                </button>
              </div>
            )}

            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-orange-500 animate-pulse font-bold tracking-widest uppercase">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                {t.varLoading}
              </div>
            ) : (
              <div className="flex flex-col xl:grid xl:grid-cols-4 gap-4 sm:gap-6 w-full flex-1 min-h-0 overflow-hidden">
                {/* 🟦 COLUMNA IZQUIERDA: MATRIZ */}
                <div
                  className={`${matrixMobileClass} ${matrixDesktopClass} ${matrixSpanClass} bg-black/80 backdrop-blur-sm border border-orange-600/50 rounded-xl flex-col shadow-2xl overflow-hidden relative xl:h-full`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="p-2 sm:p-3 border-b border-orange-600/50 flex justify-between items-center bg-[#0a0500]/90 shrink-0 relative z-10">
                    <h3 className="text-sm font-bold text-orange-400 tracking-widest uppercase flex items-center gap-2 drop-shadow-md">
                      📊 {t.varMatrixTitle}
                    </h3>
                    <button
                      onClick={() =>
                        setExpandedView(isMatrixExpanded ? "none" : "matrix")
                      }
                      className="p-1.5 bg-black/80 border border-orange-800/60 rounded-md text-orange-500 hover:bg-orange-600 hover:text-white transition-colors"
                    >
                      {isMatrixExpanded ? (
                        <Minimize2 size={16} />
                      ) : (
                        <Maximize2 size={16} />
                      )}
                    </button>
                  </div>

                  <div className="overflow-auto custom-scrollbar flex-1 min-h-0 relative bg-transparent">
                    <table className="w-full text-sm text-center whitespace-nowrap border-collapse">
                      <thead className="text-[11px] uppercase bg-black/90 sticky top-0 z-30 shadow-lg backdrop-blur-md">
                        <tr className="text-gray-300 border-b border-orange-700/60">
                          <th
                            rowSpan={2}
                            className={`px-2 sm:px-4 py-2 sm:py-3 sticky left-0 top-0 bg-[#0a0500]/95 z-40 border-r border-orange-700/60 min-w-[90px] max-w-[90px] sm:min-w-[180px] sm:max-w-none text-left truncate`}
                          >
                            {t.varParticipant}
                          </th>

                          {filteredMatches.length === 0 && (
                            <th className="px-5 py-4 text-orange-500/50 bg-transparent">
                              {t.varNoMatches}
                            </th>
                          )}

                          {filteredMatches.map((m: any) => (
                            <th
                              key={m.id}
                              colSpan={3}
                              className="px-2 py-2 border-r border-orange-800/60 bg-transparent"
                            >
                              <div className="text-orange-200/50 text-[10px] font-bold tracking-widest leading-none mb-1">
                                {formatDateShort(m.match_date)}
                              </div>
                              <div className="text-orange-400 font-black tracking-widest leading-none">
                                {formatHour(m.match_date)}
                              </div>

                              {m.home_score !== null &&
                              m.away_score !== null ? (
                                <div className="text-[10px] text-orange-200 mt-1 bg-orange-950/80 rounded inline-block px-2 py-0.5 border border-orange-700/60 shadow-inner">
                                  {t.varOfficial}: {m.home_score} -{" "}
                                  {m.away_score}
                                </div>
                              ) : (
                                <div className="text-[10px] text-orange-600 mt-1 drop-shadow-md">
                                  {t.varPending}
                                </div>
                              )}
                            </th>
                          ))}

                          {filteredMatches.length > 0 &&
                            selectedDate === "all" && (
                              <>
                                <th
                                  rowSpan={2}
                                  className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0500]/90 z-30 border-l border-orange-700/60 min-w-[80px]"
                                >
                                  <span className="text-[#22c55e] font-black tracking-widest drop-shadow-md">
                                    {t.varChamp1Title}
                                  </span>
                                  <br />
                                  <span className="text-[#22c55e]/60 text-[9px]">
                                    {t.varChamp1Sub}
                                  </span>
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0500]/90 z-30 border-l border-orange-700/60 min-w-[80px]"
                                >
                                  <span className="text-[#22c55e] font-black tracking-widest drop-shadow-md">
                                    {t.varChamp2Title}
                                  </span>
                                  <br />
                                  <span className="text-[#22c55e]/60 text-[9px]">
                                    {t.varChamp2Sub}
                                  </span>
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0500]/90 z-30 border-l border-orange-700/60 min-w-[60px]"
                                >
                                  <span className="text-[#22c55e] font-black tracking-widest drop-shadow-md">
                                    {t.varPtsCol || "PTS"}
                                  </span>
                                  <br />
                                  <span className="text-[#22c55e]/60 text-[9px]">
                                    {t.varPtsChamp}
                                  </span>
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0500]/90 z-30 border-l border-orange-700/60 min-w-[60px]"
                                >
                                  <span className="text-gray-400 font-black tracking-widest drop-shadow-md">
                                    {t.varSubtotal || "SUBTOTAL"}
                                  </span>
                                  <br />
                                  <span className="text-gray-500/80">
                                    {t.varPtsCol}
                                  </span>
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0500]/90 z-30 border-l border-r border-orange-700/60 min-w-[60px]"
                                >
                                  <span className="text-cyan-400 font-black tracking-widest drop-shadow-md">
                                    {t.varBonus || "BONO"}
                                  </span>
                                  <br />
                                  <span className="text-cyan-500/80">
                                    {t.varPtsCol}
                                  </span>
                                </th>
                              </>
                            )}

                          {filteredMatches.length > 0 && (
                            <th
                              rowSpan={2}
                              className="px-2 sm:px-4 py-2 sm:py-3 static sm:sticky right-0 top-0 bg-[#0a0500]/95 z-40 border-l border-orange-700/60 min-w-[60px] sm:min-w-[80px] shadow-none sm:shadow-[-5px_0_15px_rgba(0,0,0,0.5)]"
                            >
                              <span className="text-amber-500 font-black tracking-widest drop-shadow-md">
                                {t.varTotal}
                              </span>
                              <br />
                              <span className="text-orange-500/80">
                                {t.varPtsCol}
                              </span>
                            </th>
                          )}
                        </tr>
                        <tr className="text-gray-400 border-b border-orange-800/60 bg-[#050200]/90 text-[10px]">
                          {filteredMatches.map((m: any) => (
                            <React.Fragment key={`teams-${m.id}`}>
                              <th className="px-3 py-1.5 border-r border-orange-900/60 font-bold text-gray-300 min-w-[80px]">
                                {m.home?.[`name_${lang}`]?.toUpperCase() ||
                                  t.bracketTBD}
                              </th>
                              <th className="px-3 py-1.5 border-r border-orange-900/60 font-bold text-gray-300 min-w-[80px]">
                                {m.away?.[`name_${lang}`]?.toUpperCase() ||
                                  t.bracketTBD}
                              </th>
                              <th className="px-2 py-1.5 border-r border-orange-800/60 w-14 text-orange-500 font-black bg-orange-950/20">
                                {t.varPtsCol}
                              </th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-orange-900/40">
                        {sortedParticipants.map((user: any) => {
                          const matchPoints = filteredMatches.reduce(
                            (acc: number, m: any) => {
                              const pred = data?.predictions?.find(
                                (p: any) =>
                                  p.user_id === user.id && p.match_id === m.id,
                              );
                              return acc + (pred?.points_won || 0);
                            },
                            0,
                          );

                          let userBonus = 0;
                          let champPts = 0;

                          if (selectedDate === "all") {
                            champPts = user.champPts || 0;
                            if (data?.bonusPoints) {
                              userBonus = data.bonusPoints
                                .filter((b: any) => b.user_id === user.id)
                                .reduce(
                                  (acc: number, curr: any) =>
                                    acc + (curr.points_won || 0),
                                  0,
                                );
                            }
                          }

                          const rowTotalPoints =
                            matchPoints + userBonus + champPts;

                          return (
                            <tr
                              key={user.id}
                              className="hover:bg-orange-950/40 transition-colors group"
                            >
                              <td className="px-2 sm:px-4 py-2 font-bold text-xs sm:text-sm sticky left-0 bg-black/90 group-hover:bg-[#0a0500]/95 border-r border-orange-800/50 z-20 text-left truncate max-w-[90px] sm:max-w-[200px] text-gray-200 backdrop-blur-sm">
                                {user.username}
                              </td>
                              {filteredMatches.map((m: any) => {
                                const pred = data?.predictions?.find(
                                  (p: any) =>
                                    p.user_id === user.id &&
                                    p.match_id === m.id,
                                );
                                return (
                                  <React.Fragment key={`${user.id}-${m.id}`}>
                                    <td className="px-2 py-2 border-r border-orange-900/40 font-mono text-gray-300 text-xs">
                                      {pred?.pred_home ?? "-"}
                                    </td>
                                    <td className="px-2 py-2 border-r border-orange-900/40 font-mono text-gray-300 text-xs">
                                      {pred?.pred_away ?? "-"}
                                    </td>
                                    <td className="px-1 py-2 border-r border-orange-800/50 font-mono bg-orange-950/20 text-center backdrop-blur-[2px]">
                                      {m.home_score !== null &&
                                      m.away_score !== null ? (
                                        getPointsTag(
                                          pred?.points_won,
                                          data?.scoreConfig,
                                        )
                                      ) : (
                                        <span className="text-gray-500/80 font-bold">
                                          -
                                        </span>
                                      )}
                                    </td>
                                  </React.Fragment>
                                );
                              })}

                              {filteredMatches.length > 0 &&
                                selectedDate === "all" && (
                                  <>
                                    <td className="px-1 py-2 border-l border-orange-800/50 bg-[#0a150a]/40 text-center min-w-[60px] align-middle">
                                      {user.champion1 ? (
                                        <div className="flex flex-col items-center justify-center gap-1">
                                          <img
                                            src={
                                              getFlagUrl(user.champion1) ||
                                              "/images/flags/placeholder.svg"
                                            }
                                            alt={user.champion1[`name_${lang}`]}
                                            className="w-6 h-4 object-cover rounded shadow-sm opacity-90"
                                            title={
                                              user.champion1[`name_${lang}`]
                                            }
                                          />
                                          <span className="text-[9px] text-gray-300 uppercase leading-none truncate w-12 drop-shadow-md">
                                            {user.champion1[
                                              `name_${lang}`
                                            ]?.substring(0, 3)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-600 font-bold">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-1 py-2 border-l border-orange-800/50 bg-[#0a150a]/40 text-center min-w-[60px] align-middle">
                                      {user.champion2 ? (
                                        <div className="flex flex-col items-center justify-center gap-1">
                                          <img
                                            src={
                                              getFlagUrl(user.champion2) ||
                                              "/images/flags/placeholder.svg"
                                            }
                                            alt={user.champion2[`name_${lang}`]}
                                            className="w-6 h-4 object-cover rounded shadow-sm opacity-90"
                                            title={
                                              user.champion2[`name_${lang}`]
                                            }
                                          />
                                          <span className="text-[9px] text-gray-300 uppercase leading-none truncate w-12 drop-shadow-md">
                                            {user.champion2[
                                              `name_${lang}`
                                            ]?.substring(0, 3)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-600 font-bold">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-2 py-2 border-l border-orange-800/50 bg-[#0a150a]/60 text-center font-black text-[#22c55e] align-middle drop-shadow-md">
                                      {user.champPts > 0
                                        ? `+${user.champPts}`
                                        : "-"}
                                    </td>

                                    <td className="px-2 py-2 border-l border-orange-800/50 text-center font-black text-gray-200 align-middle drop-shadow-md">
                                      {matchPoints}
                                    </td>
                                    <td className="px-2 py-2 border-l border-r border-orange-800/50 text-center font-black text-cyan-400 align-middle drop-shadow-md">
                                      {userBonus > 0 ? `+${userBonus}` : "-"}
                                    </td>
                                  </>
                                )}

                              {filteredMatches.length > 0 && (
                                <td className="px-2 sm:px-4 py-2 font-black static sm:sticky right-0 bg-black/90 group-hover:bg-[#0a0500]/95 border-l border-orange-800/50 text-amber-500 z-20 text-base shadow-none sm:shadow-[-5px_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm drop-shadow-md">
                                  {rowTotalPoints}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 🟧 COLUMNA DERECHA: LEADERBOARD */}
                <div
                  className={`${positionsMobileClass} ${positionsDesktopClass} ${positionsSpanClass} bg-black/80 backdrop-blur-sm border border-orange-600/50 rounded-xl flex-col shadow-2xl overflow-hidden xl:h-full`}
                >
                  <div className="p-2 sm:p-3 border-b border-orange-600/50 flex justify-between items-center bg-[#0a0500]/90 shrink-0">
                    <h3 className="text-sm font-bold text-orange-400 tracking-widest uppercase flex items-center gap-2 drop-shadow-md">
                      🏆 {t.varPositionsTitle}
                    </h3>
                    <button
                      onClick={() =>
                        setExpandedView(
                          isPositionsExpanded ? "none" : "positions",
                        )
                      }
                      className="p-1.5 bg-black/80 border border-orange-800/60 rounded-md text-orange-500 hover:bg-orange-600 hover:text-white transition-colors"
                    >
                      {isPositionsExpanded ? (
                        <Minimize2 size={16} />
                      ) : (
                        <Maximize2 size={16} />
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-0 p-2 bg-transparent w-full">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead
                        className={`text-[10px] ${expandedTextHeader} text-orange-500 uppercase border-b border-orange-700/60 sticky top-0 bg-black/90 backdrop-blur-md z-10 shadow-md`}
                      >
                        <tr>
                          <th className="px-2 py-2 text-center w-8 bg-transparent whitespace-nowrap">
                            #
                          </th>
                          <th className="px-2 py-2 bg-transparent whitespace-nowrap">
                            {t.varParticipant}
                          </th>
                          <th className="px-2 py-2 text-center bg-transparent whitespace-nowrap">
                            {t.varSubDate}
                          </th>

                          <th
                            className={`px-2 py-2 text-center bg-transparent whitespace-nowrap ${detailColClass}`}
                          >
                            🎯 {t.varExact || "EXACTO"}
                          </th>
                          <th
                            className={`px-2 py-2 text-center bg-transparent whitespace-nowrap ${detailColClass}`}
                          >
                            ⭐ {t.varDiff || "DIFERENCIA"}
                          </th>
                          <th
                            className={`px-2 py-2 text-center bg-transparent whitespace-nowrap ${detailColClass}`}
                          >
                            ✅ {t.varWinner || "GANADOR"}
                          </th>
                          <th
                            className={`px-2 py-2 text-center bg-transparent whitespace-nowrap ${detailColClass}`}
                          >
                            🏆 {t.varBonusGrp || "BONO GRP"}
                          </th>
                          <th
                            className={`px-2 py-2 text-center bg-transparent whitespace-nowrap ${detailColClass}`}
                          >
                            👑 {t.varBonusChamp || "BONO CAMP"}
                          </th>

                          <th className="px-2 py-2 text-right bg-transparent whitespace-nowrap">
                            {t.varPtsCol}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-900/40">
                        {leaderboard.map((user: any, index: number) => {
                          const locale = lang === "es" ? "es-ES" : "en-US";
                          const subDate = user.sub_date_groups
                            ? new Date(user.sub_date_groups).toLocaleDateString(
                                locale,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "-";

                          return (
                            <tr
                              key={`lb-${user.id}`}
                              className="hover:bg-orange-950/40 transition-colors"
                            >
                              <td
                                className={`px-2 py-3 text-center font-black text-orange-400 whitespace-nowrap drop-shadow-md ${expandedTextData}`}
                              >
                                {index + 1}
                              </td>
                              <td
                                className={`px-2 py-3 font-bold text-gray-100 truncate max-w-[120px] whitespace-nowrap drop-shadow-md ${expandedTextData}`}
                                title={user.username}
                              >
                                {user.username}
                              </td>
                              <td
                                className={`px-1 py-3 text-center text-[10px] text-orange-200/80 uppercase tracking-tighter whitespace-nowrap ${expandedTextHeader}`}
                                title={user.sub_date_groups}
                              >
                                {subDate}
                              </td>

                              <td
                                className={`px-2 py-3 text-center font-mono font-bold text-green-400 whitespace-nowrap bg-green-950/20 backdrop-blur-[2px] ${detailColClass} ${expandedTextData}`}
                              >
                                {user.exactPts > 0 ? `+${user.exactPts}` : "-"}
                              </td>
                              <td
                                className={`px-2 py-3 text-center font-mono font-bold text-blue-400 whitespace-nowrap bg-blue-950/20 backdrop-blur-[2px] ${detailColClass} ${expandedTextData}`}
                              >
                                {user.diffPts > 0 ? `+${user.diffPts}` : "-"}
                              </td>
                              <td
                                className={`px-2 py-3 text-center font-mono font-bold text-amber-400 whitespace-nowrap bg-amber-950/20 backdrop-blur-[2px] ${detailColClass} ${expandedTextData}`}
                              >
                                {user.winnerPts > 0
                                  ? `+${user.winnerPts}`
                                  : "-"}
                              </td>
                              <td
                                className={`px-2 py-3 text-center font-mono font-black text-cyan-400 whitespace-nowrap bg-cyan-950/20 backdrop-blur-[2px] border-l border-orange-900/50 ${detailColClass} ${expandedTextData}`}
                              >
                                {user.bonusGrp > 0 ? `+${user.bonusGrp}` : "-"}
                              </td>

                              <td
                                className={`px-2 py-3 text-center font-mono font-black text-purple-400 whitespace-nowrap bg-purple-950/20 backdrop-blur-[2px] border-r border-orange-900/50 ${detailColClass} ${expandedTextData}`}
                              >
                                {user.champPts > 0 ? `+${user.champPts}` : "-"}
                              </td>

                              <td
                                className={`px-2 py-3 text-right font-black text-white whitespace-nowrap text-base drop-shadow-md ${expandedTextTotal}`}
                              >
                                {user.totalPoints}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
