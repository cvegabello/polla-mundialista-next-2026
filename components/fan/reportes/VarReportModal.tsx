"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getVarReportDataAction } from "@/lib/actions/fan-actions";
import { X, RefreshCw } from "lucide-react";

interface VarReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VarReportModal = ({ isOpen, onClose }: VarReportModalProps) => {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  const todayIso = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

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

  const filteredMatches = useMemo(() => {
    if (!data?.matches) return [];
    if (selectedDate === "all") return data.matches;
    return data.matches.filter((m: any) => {
      if (!m.match_date) return false;
      const matchDateStr = new Date(m.match_date).toISOString().split("T")[0];
      return matchDateStr === selectedDate;
    });
  }, [data?.matches, selectedDate]);

  // 1. Leaderboard original (Ordenado por Puntos y Fecha de desempate)
  const leaderboard = useMemo(() => {
    if (!data?.participants || !data?.predictions) return [];
    const scores = data.participants.map((p: any) => {
      const userPreds = data.predictions.filter(
        (pred: any) => pred.user_id === p.id,
      );
      const totalPoints = userPreds.reduce(
        (acc: number, curr: any) => acc + (curr.points_won || 0),
        0,
      );
      return { ...p, totalPoints };
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

  // 🚀 2. NUEVO: Matriz alfabética (Copia del leaderboard pero ordenada de la A a la Z)
  const alphabeticalParticipants = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      const nameA = a.username ? a.username.toLowerCase() : "";
      const nameB = b.username ? b.username.toLowerCase() : "";
      return nameA.localeCompare(nameB);
    });
  }, [leaderboard]);

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
    return new Date(dateString)
      .toLocaleDateString("es-ES", { day: "numeric", month: "short" })
      .toUpperCase();
  };

  const formatHour = (dateString: string) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-[1600px] h-[90vh] bg-black border-2 border-orange-500 shadow-[0_0_50px_-10px_rgba(249,115,22,0.4)] rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b border-orange-600 bg-[#050200] shrink-0 gap-4 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 tracking-tighter uppercase flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)]">
              👁️ El VAR
            </h2>
            <p className="text-xs text-orange-300 mt-0.5 tracking-widest uppercase font-semibold">
              Auditoría de pronósticos en vivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-black border border-orange-600 rounded-lg overflow-hidden focus-within:border-orange-400 focus-within:shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all">
              <span className="pl-3 text-orange-500 text-sm">📅</span>
              <input
                type="date"
                value={selectedDate === "all" ? "" : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm font-bold block p-2 outline-none cursor-pointer" // 🚀 Cursor manita en el input
                style={{ colorScheme: "dark" }}
              />
            </div>
            <button
              onClick={() => setSelectedDate("all")}
              className={`cursor-pointer text-sm font-bold py-2 px-4 rounded-lg transition-all border ${selectedDate === "all" ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-black border-orange-700 text-orange-400 hover:bg-[#1a0a00] hover:border-orange-500"}`} // 🚀 Cursor manita
            >
              🌎 Todas las Fechas
            </button>

            {/* BOTÓN DE REFRESCAR */}
            <button
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              className="ml-2 p-2 cursor-pointer bg-black border border-orange-700 text-orange-500 hover:bg-orange-600 hover:text-white hover:border-orange-500 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" // 🚀 Cursor manita
              title="Refrescar resultados en vivo"
            >
              <RefreshCw
                size={20}
                className={`stroke-[3] ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* BOTÓN DE CERRAR */}
            <button
              onClick={onClose}
              className="p-2 cursor-pointer bg-black border border-orange-700 text-orange-500 hover:bg-red-600 hover:text-white hover:border-red-500 rounded-lg transition-all shadow-sm" // 🚀 Cursor manita
              title="Cerrar VAR"
            >
              <X size={20} className="stroke-[3]" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL MODAL */}
        <div className="flex-1 overflow-hidden p-5 bg-black">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-orange-500 animate-pulse font-bold tracking-widest uppercase">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
              Cargando el VAR...
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full h-full">
              {/* 🟦 COLUMNA IZQUIERDA: MATRIZ DE PRONÓSTICOS (AHORA ALFABÉTICA) */}
              <div className="xl:col-span-3 bg-black border border-orange-600/50 rounded-xl flex flex-col shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="p-3 border-b border-orange-600/50 flex justify-between items-center bg-[#0a0500] shrink-0 relative z-10">
                  <h3 className="text-sm font-bold text-orange-400 tracking-widest uppercase">
                    Matriz de Participantes (A-Z)
                  </h3>
                </div>

                <div className="overflow-auto custom-scrollbar flex-1 relative bg-black">
                  <table className="w-full text-sm text-center whitespace-nowrap border-collapse">
                    <thead className="text-[11px] uppercase bg-black sticky top-0 z-30 shadow-lg">
                      <tr className="text-gray-300 border-b border-orange-700/60">
                        <th
                          rowSpan={2}
                          className="px-4 py-3 sticky left-0 top-0 bg-[#0a0500] z-40 border-r border-orange-700/60 min-w-[180px] text-left"
                        >
                          PARTICIPANTE
                        </th>
                        {filteredMatches.length === 0 && (
                          <th className="px-5 py-4 text-orange-500/50 bg-black">
                            No hay partidos para esta fecha
                          </th>
                        )}
                        {filteredMatches.map((m: any) => (
                          <th
                            key={m.id}
                            colSpan={3}
                            className="px-2 py-2 border-r border-orange-800/60 bg-black"
                          >
                            <div className="text-orange-200/50 text-[10px] font-bold tracking-widest leading-none mb-1">
                              {formatDateShort(m.match_date)}
                            </div>
                            <div className="text-orange-400 font-black tracking-widest leading-none">
                              {formatHour(m.match_date)}
                            </div>

                            {m.home_score !== null && m.away_score !== null ? (
                              <div className="text-[10px] text-orange-200 mt-1 bg-orange-950 rounded inline-block px-2 py-0.5 border border-orange-700/60 shadow-inner">
                                OFICIAL: {m.home_score} - {m.away_score}
                              </div>
                            ) : (
                              <div className="text-[10px] text-orange-600 mt-1">
                                PENDIENTE
                              </div>
                            )}
                          </th>
                        ))}
                        {filteredMatches.length > 0 && (
                          <th
                            rowSpan={2}
                            className="px-4 py-3 sticky right-0 top-0 bg-[#0a0500] z-40 border-l border-orange-700/60 min-w-[80px] shadow-[-5px_0_15px_rgba(0,0,0,0.5)]"
                          >
                            <span className="text-amber-500 font-black tracking-widest">
                              TOTAL
                            </span>
                            <br />
                            <span className="text-orange-500/80">PTS</span>
                          </th>
                        )}
                      </tr>
                      <tr className="text-gray-400 border-b border-orange-800/60 bg-[#050200] text-[10px]">
                        {filteredMatches.map((m: any) => (
                          <React.Fragment key={`teams-${m.id}`}>
                            <th className="px-3 py-1.5 border-r border-orange-900/60 font-bold text-gray-300 min-w-[80px]">
                              {m.home?.name_es?.toUpperCase() || "TBD"}
                            </th>
                            <th className="px-3 py-1.5 border-r border-orange-900/60 font-bold text-gray-300 min-w-[80px]">
                              {m.away?.name_es?.toUpperCase() || "TBD"}
                            </th>
                            <th className="px-2 py-1.5 border-r border-orange-800/60 w-14 text-orange-500 font-black bg-orange-950/20">
                              PTS
                            </th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-orange-900/40">
                      {/* 🚀 Usamos alphabeticalParticipants en lugar de leaderboard */}
                      {alphabeticalParticipants.map((user: any) => {
                        const rowTotalPoints = filteredMatches.reduce(
                          (acc: number, m: any) => {
                            const pred = data?.predictions?.find(
                              (p: any) =>
                                p.user_id === user.id && p.match_id === m.id,
                            );
                            return acc + (pred?.points_won || 0);
                          },
                          0,
                        );

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-orange-950/30 transition-colors group"
                          >
                            <td className="px-4 py-2 font-bold sticky left-0 bg-black group-hover:bg-[#0a0500] border-r border-orange-800/50 z-20 text-left truncate max-w-[200px] text-gray-200">
                              {user.username}
                            </td>
                            {filteredMatches.map((m: any) => {
                              const pred = data?.predictions?.find(
                                (p: any) =>
                                  p.user_id === user.id && p.match_id === m.id,
                              );
                              return (
                                <React.Fragment key={`${user.id}-${m.id}`}>
                                  <td className="px-2 py-2 border-r border-orange-900/40 font-mono text-gray-300 text-xs">
                                    {pred?.pred_home ?? "-"}
                                  </td>
                                  <td className="px-2 py-2 border-r border-orange-900/40 font-mono text-gray-300 text-xs">
                                    {pred?.pred_away ?? "-"}
                                  </td>
                                  <td className="px-1 py-2 border-r border-orange-800/50 font-mono bg-orange-950/10">
                                    {getPointsTag(
                                      pred?.points_won,
                                      data?.scoreConfig,
                                    )}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                            {filteredMatches.length > 0 && (
                              <td className="px-4 py-2 font-black sticky right-0 bg-black group-hover:bg-[#0a0500] border-l border-orange-800/50 text-amber-500 z-20 text-base shadow-[-5px_0_15px_rgba(0,0,0,0.5)]">
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

              {/* 🟧 COLUMNA DERECHA: LEADERBOARD (Mantiene el orden por puntos) */}
              <div className="xl:col-span-1 bg-black border border-orange-600/50 rounded-xl flex flex-col shadow-2xl h-full overflow-hidden">
                <div className="p-3 border-b border-orange-600/50 flex justify-between items-center bg-[#0a0500] shrink-0">
                  <h3 className="text-sm font-bold text-orange-400 tracking-widest uppercase flex items-center gap-2">
                    🏆 Posiciones
                  </h3>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 p-2 bg-black">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-[10px] text-orange-500 uppercase border-b border-orange-700/60">
                      <tr>
                        <th className="px-2 py-2 text-center w-8">#</th>
                        <th className="px-2 py-2">Participante</th>
                        <th className="px-2 py-2 text-center">Envío</th>
                        <th className="px-2 py-2 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-900/40">
                      {/* 🚀 Aquí seguimos usando leaderboard para las posiciones */}
                      {leaderboard.map((user: any, index: number) => {
                        const subDate = user.sub_date_groups
                          ? new Date(user.sub_date_groups).toLocaleDateString(
                              "es-ES",
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
                            className="hover:bg-orange-950/30 transition-colors"
                          >
                            <td className="px-2 py-3 text-center font-black text-orange-500">
                              {index + 1}
                            </td>
                            <td
                              className="px-2 py-3 font-bold text-gray-200 truncate max-w-[100px]"
                              title={user.username}
                            >
                              {user.username}
                            </td>
                            <td
                              className="px-1 py-3 text-center text-[10px] text-orange-300/60 uppercase tracking-tighter"
                              title={user.sub_date_groups}
                            >
                              {subDate}
                            </td>
                            <td className="px-2 py-3 text-right font-black text-white">
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
  );
};
