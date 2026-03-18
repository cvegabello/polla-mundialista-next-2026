"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getVarReportDataAction } from "@/lib/actions/fan-actions";
import { StarBackground } from "@/components/shared/StarBackground";

export default function VarReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Por defecto, ponemos la fecha de hoy
  const todayIso = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  useEffect(() => {
    const fetchData = async () => {
      const match = document.cookie.match(
        new RegExp("(^| )polla_session=([^;]+)"),
      );
      if (match) {
        try {
          let cookieValue = match[2];
          cookieValue = decodeURIComponent(cookieValue);
          if (cookieValue.startsWith("%")) {
            cookieValue = decodeURIComponent(cookieValue);
          }

          const session = JSON.parse(cookieValue);
          if (session?.id) {
            const result = await getVarReportDataAction(session.id);

            if (result.success) {
              setData(result.data);
            } else {
              // ESTO ES CLAVE: Nos va a gritar en la pantalla qué está fallando
              alert("⚠️ ERROR DE BASE DE DATOS: " + result.error);
            }
          }
        } catch (e) {
          console.error("Error parseando sesión", e);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // 🧮 1. FILTRAR PARTIDOS POR FECHA
  const filteredMatches = useMemo(() => {
    if (!data?.matches) return [];
    if (selectedDate === "all") return data.matches;

    return data.matches.filter((m: any) => {
      if (!m.match_date) return false;
      // Convertimos el timestamptz de la BD a formato YYYY-MM-DD local
      const matchDateStr = new Date(m.match_date).toISOString().split("T")[0];
      return matchDateStr === selectedDate;
    });
  }, [data?.matches, selectedDate]);

  // 🏆 2. CALCULAR TABLA DE POSICIONES
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

    // Ordenar de mayor a menor
    return scores.sort((a: any, b: any) => b.totalPoints - a.totalPoints);
  }, [data]);

  // 🎨 AYUDANTE VISUAL PARA LOS PUNTOS
  // 🎨 AYUDANTE VISUAL PARA LOS PUNTOS (DINÁMICO SEGÚN LA CONFIGURACIÓN)
  const getPointsTag = (points: number | null, config: any) => {
    if (points === null || points === undefined)
      return <span className="text-slate-500 font-bold">-</span>;
    if (points === 0)
      return (
        <span className="text-red-400 bg-red-500/10 px-1 py-0.5 rounded text-[10px] font-black">
          ❌ 0
        </span>
      );

    // Valores por defecto en caso de que la BD no responda la config
    const exactPts = config?.exact_score ?? 5;
    const diffPts = config?.goal_diff ?? 3;
    const winnerPts = config?.winner_only ?? 1;

    // Comparamos los puntos ganados con lo que dice la tabla score_configs
    if (points === exactPts)
      return (
        <span className="text-green-400 bg-green-500/10 px-1 py-0.5 rounded text-[10px] font-black">
          🎯 +{points}
        </span>
      );
    if (points === diffPts)
      return (
        <span className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded text-[10px] font-black">
          ⭐ +{points}
        </span>
      );
    if (points === winnerPts)
      return (
        <span className="text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded text-[10px] font-black">
          ✅ +{points}
        </span>
      );

    return (
      <span className="text-green-400 bg-green-500/10 px-1 py-0.5 rounded text-[10px] font-black">
        +{points}
      </span>
    );
  };

  const formatHour = (dateString: string) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 animate-pulse font-bold tracking-widest uppercase">
        Cargando el VAR...
      </div>
    );
  }

  return (
    <main className="min-h-screen transition-colors duration-300 bg-transparent dark:bg-transparent relative pb-20 overflow-x-hidden flex flex-col px-4 md:px-8 pt-8">
      <StarBackground />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col flex-1 h-[calc(100vh-40px)]">
        {/* CABECERA */}
        <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 border-b border-white/10 pb-4 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-500 tracking-tighter uppercase flex items-center gap-2">
              👁️ Reporte General (VAR)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              El centro de mando. Revisa los pronósticos de todos tus
              contrincantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors mr-4"
            >
              ⬅ Volver a mi Polla
            </button>

            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-md focus-within:border-pink-500 transition-colors">
              <span className="pl-3 text-slate-400 text-sm">📅</span>
              <input
                type="date"
                value={selectedDate === "all" ? "" : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm font-bold block p-2.5 outline-none cursor-pointer"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <button
              onClick={() => setSelectedDate("all")}
              className={`border text-sm font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors ${selectedDate === "all" ? "bg-pink-600 border-pink-500 text-white" : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300"}`}
            >
              🌎 Todas las Fechas
            </button>

            <button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
              Exportar CSV
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* MATRIZ DE PRONÓSTICOS ESTILO EXCEL */}
          <div className="xl:col-span-3 bg-slate-900/60 backdrop-blur-md rounded-2xl flex flex-col shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/30 shrink-0">
              <h2 className="text-lg font-bold text-pink-400 tracking-widest uppercase">
                Matriz de Pronósticos
              </h2>
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1">
                <span>🔒</span> Auditado
              </div>
            </div>

            <div className="overflow-auto custom-scrollbar flex-1 relative bg-black/40">
              <table className="w-full text-sm text-center whitespace-nowrap">
                <thead className="text-xs uppercase bg-slate-800 sticky top-0 z-30 shadow-md">
                  <tr className="text-slate-300 border-b border-slate-700">
                    <th
                      rowSpan={2}
                      className="px-5 py-4 sticky left-0 top-0 bg-slate-900 z-40 border-r-2 border-slate-600 min-w-[180px] text-left"
                    >
                      PARTICIPANTE
                    </th>

                    {filteredMatches.length === 0 && (
                      <th className="px-5 py-4 text-slate-500 bg-slate-800/80">
                        No hay partidos para esta fecha
                      </th>
                    )}

                    {filteredMatches.map((m: any) => (
                      <th
                        key={m.id}
                        colSpan={3}
                        className="px-2 py-2 bg-slate-800/80 border-r-2 border-slate-600"
                      >
                        <div className="text-amber-400 font-black tracking-widest">
                          {formatHour(m.match_date)}
                        </div>
                        {m.home_score !== null && m.away_score !== null ? (
                          <div className="text-[10px] text-white tracking-widest mt-0.5 bg-slate-900 rounded inline-block px-2 py-0.5 border border-slate-600 shadow-inner">
                            OFICIAL: {m.home_score} - {m.away_score}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 tracking-widest mt-0.5">
                            PENDIENTE
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>

                  <tr className="text-slate-400 border-b-2 border-slate-600 bg-slate-900 text-[11px]">
                    {filteredMatches.map((m: any) => (
                      <React.Fragment key={`teams-${m.id}`}>
                        <th className="px-3 py-2 border-r border-slate-700 w-12">
                          {m.home?.name_es?.substring(0, 3).toUpperCase() ||
                            "TBD"}
                        </th>
                        <th className="px-3 py-2 border-r border-slate-700 w-12">
                          {m.away?.name_es?.substring(0, 3).toUpperCase() ||
                            "TBD"}
                        </th>
                        <th className="px-2 py-2 border-r-2 border-slate-600 w-12 text-pink-500 font-black">
                          PTS
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700/50">
                  {leaderboard.map((user: any, index: number) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-bold sticky left-0 bg-[#0f1523] border-r-2 border-slate-600 z-20 text-left truncate max-w-[200px]">
                        {index + 1}. {user.username}
                      </td>

                      {filteredMatches.map((m: any) => {
                        const pred = data.predictions.find(
                          (p: any) =>
                            p.user_id === user.id && p.match_id === m.id,
                        );
                        return (
                          <React.Fragment key={`${user.id}-${m.id}`}>
                            <td className="px-2 py-3 border-r border-slate-700 font-mono text-white">
                              {pred?.pred_home ?? "-"}
                            </td>
                            <td className="px-2 py-3 border-r border-slate-700 font-mono text-white">
                              {pred?.pred_away ?? "-"}
                            </td>
                            <td className="px-1 py-3 border-r-2 border-slate-600 font-mono">
                              {getPointsTag(
                                pred?.points_won,
                                data?.scoreConfig,
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LEADERBOARD LATERAL */}
          <div className="xl:col-span-1 bg-slate-900/60 backdrop-blur-md rounded-2xl flex flex-col shadow-2xl border border-white/10 h-full overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/30 shrink-0">
              <h2 className="text-lg font-bold text-amber-400 tracking-widest uppercase flex items-center gap-2">
                🏆 Posiciones
              </h2>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-700">
                  <tr>
                    <th className="px-2 py-2 text-center w-8">#</th>
                    <th className="px-2 py-2">Participante</th>
                    <th className="px-2 py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {leaderboard.map((user: any, index: number) => (
                    <tr
                      key={`lb-${user.id}`}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-2 py-3 text-center font-black text-amber-400">
                        {index + 1}
                      </td>
                      <td
                        className="px-2 py-3 font-bold text-slate-200 truncate max-w-[120px]"
                        title={user.username}
                      >
                        {user.username}
                      </td>
                      <td className="px-2 py-3 text-right font-black text-white">
                        {user.totalPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
