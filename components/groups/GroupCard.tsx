"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { Loader2 } from "lucide-react"; // Usamos el ícono de carga para que se vea pro

// --- TIPOS ---
export interface Team {
  name_es: string;
  name_en?: string;
  flag_code: string;
}

interface MatchReal {
  id: number;
  match_date: string;
  stadium: string;
  city: string;
  home_score?: number | null;
  away_score?: number | null;
  home_team: Team;
  away_team: Team;
}

interface GroupDataReal {
  id: string;
  name: string;
  matches: MatchReal[];
}

interface GroupCardProps {
  group: GroupDataReal;
  lang?: Language;
}

interface TableStats {
  team: string;
  pts: number;
  gf: number;
  gc: number;
  pos: number;
  isTied: boolean;
}

export const GroupCard = ({ group, lang = "es" }: GroupCardProps) => {
  const t = DICTIONARY[lang];

  // 1. CLIENTE SUPABASE
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // ESTADOS
  const [matches, setMatches] = useState<MatchReal[]>(group.matches);
  const [tableData, setTableData] = useState<TableStats[]>([]);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // ESTADOS DE SESIÓN
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  // 👇 NUEVO: Estado para saber si estamos leyendo el brazalete
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. CARGA INICIAL (Lectura de Datos y Sesión) ---
  useEffect(() => {
    const initData = async () => {
      try {
        setIsSessionLoading(true); // Arrancamos cargando

        // A. LEER LA SESIÓN REAL (localStorage)
        const sessionStr = localStorage.getItem("polla_session");

        // Validamos si hay sesión
        if (!sessionStr) {
          console.error("❌ No hay sesión activa en GroupCard");
          setIsSessionLoading(false);
          return;
        }

        const session = JSON.parse(sessionStr);
        const currentUserId = session.id;
        const currentRole = session.role;

        // Guardamos la identidad
        setAdminUserId(currentUserId);
        setUserRole(currentRole);

        // SI ES ADMIN: Cortamos aquí, no necesita cargar predicciones
        if (currentRole === "ADMIN_GRUPO") {
          setIsSessionLoading(false);
          return;
        }

        // B. Cargar pronósticos (SOLO SI ES FAN)
        const matchIdsInGroup = group.matches.map((m) => m.id);
        const { data: predictions } = await supabase
          .from("predictions")
          .select("match_id, pred_home, pred_away")
          .eq("user_id", currentUserId)
          .in("match_id", matchIdsInGroup);

        if (predictions && predictions.length > 0) {
          setMatches((prevMatches) => {
            return prevMatches.map((match) => {
              const pred = predictions.find((p) => p.match_id === match.id);
              if (pred) {
                return {
                  ...match,
                  home_score: pred.pred_home,
                  away_score: pred.pred_away,
                };
              }
              return match;
            });
          });
        }
      } catch (err) {
        console.error("Error initData:", err);
      } finally {
        // 👇 IMPORTANTE: Pase lo que pase, terminamos de cargar
        setIsSessionLoading(false);
      }
    };

    initData();
  }, [group.matches]);

  // --- 3. TIEMPO REAL ---
  useEffect(() => {
    if (!adminUserId) return;

    const channel = supabase
      .channel(`realtime-predictions-${group.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "predictions",
          filter: `user_id=eq.${adminUserId}`,
        },
        (payload) => {
          const newPrediction = payload.new as any;
          setMatches((prevMatches) =>
            prevMatches.map((match) => {
              if (match.id === newPrediction.match_id) {
                return {
                  ...match,
                  home_score: newPrediction.pred_home,
                  away_score: newPrediction.pred_away,
                };
              }
              return match;
            }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminUserId, group.id]);

  // --- LÓGICA TABLA ---
  const calculateStandings = (currentMatches: MatchReal[]) => {
    const stats: Record<string, { pts: 0; gf: 0; gc: 0 }> = {};
    const getName = (team: Team) =>
      lang === "en" ? team.name_en || team.name_es : team.name_es;

    currentMatches.forEach((m) => {
      const hName = getName(m.home_team);
      const aName = getName(m.away_team);
      if (!stats[hName]) stats[hName] = { pts: 0, gf: 0, gc: 0 };
      if (!stats[aName]) stats[aName] = { pts: 0, gf: 0, gc: 0 };
    });

    currentMatches.forEach((m) => {
      if (m.home_score != null && m.away_score != null) {
        const h = Number(m.home_score);
        const a = Number(m.away_score);
        const hName = getName(m.home_team);
        const aName = getName(m.away_team);

        stats[hName].gf += h;
        stats[hName].gc += a;
        stats[aName].gf += a;
        stats[aName].gc += h;

        if (h > a) stats[hName].pts += 3;
        else if (a > h) stats[aName].pts += 3;
        else {
          stats[hName].pts += 1;
          stats[aName].pts += 1;
        }
      }
    });

    let sortedTeams = Object.entries(stats).map(([team, data]) => ({
      team,
      pts: data.pts,
      gf: data.gf,
      gc: data.gc,
      dg: data.gf - data.gc,
      pos: 0,
      isTied: false,
    }));

    sortedTeams.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });

    const finalData = sortedTeams.map((item, index, array) => {
      let isTied = false;
      if (index > 0) {
        const prev = array[index - 1];
        if (
          prev.pts === item.pts &&
          prev.dg === item.dg &&
          prev.gf === item.gf
        ) {
          isTied = true;
          prev.isTied = true;
        }
      }
      return { ...item, pos: index + 1, isTied: isTied || item.isTied };
    });
    setTableData(finalData);
  };

  useEffect(() => {
    calculateStandings(matches);
  }, [matches, lang]);

  // --- GUARDADO EN DB ---
  const saveToDatabase = async (
    matchId: number,
    homeScore: number | null,
    awayScore: number | null,
  ) => {
    try {
      setSaveStatus("saving");
      if (!adminUserId) {
        setSaveStatus("error");
        return;
      }
      const payload = {
        user_id: adminUserId,
        match_id: matchId,
        pred_home: homeScore,
        pred_away: awayScore,
      };
      const { error } = await supabase
        .from("predictions")
        .upsert(payload, { onConflict: "user_id, match_id" });
      if (error) throw error;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error guardando:", error);
      setSaveStatus("error");
    }
  };

  const handleScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId)
        return type === "home"
          ? { ...m, home_score: newVal }
          : { ...m, away_score: newVal };
      return m;
    });
    setMatches(updatedMatches);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const matchToSave = updatedMatches.find((m) => m.id === matchId);
    if (matchToSave) {
      saveTimeoutRef.current = setTimeout(() => {
        saveToDatabase(
          matchToSave.id,
          matchToSave.home_score ?? null,
          matchToSave.away_score ?? null,
        );
      }, 1000);
    }
  };

  // ----------------------------------------------------
  // 👇 RENDERIZADO CONTROLADO (Evita pantalla blanca)
  // ----------------------------------------------------

  // 1. CARGANDO... (Muestra algo mientras lee el localStorage)
  if (isSessionLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-slate-900/20 rounded-xl border border-white/5 animate-pulse">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // 2. VISTA DE ADMIN (Si el rol es ADMIN_GRUPO)
  if (userRole === "ADMIN_GRUPO") {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-white/10 mt-4 backdrop-blur-md">
        <h2 className="text-xl font-bold text-gray-300">Vista de Admin</h2>
        <p className="text-sm text-gray-500 mt-2">
          Gestiona este grupo desde el panel principal.
        </p>
      </div>
    );
  }

  // 3. VISTA DE FAN (Si es fan y ya cargó)
  return (
    <div className="relative group w-full max-w-[350px] mx-auto transition-all duration-300">
      <div className="absolute -inset-1 rounded-2xl blur-md transition duration-500 bg-linear-to-r from-cyan-500 to-purple-600 dark:from-orange-500 dark:to-white opacity-25 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-100"></div>

      <div className="relative bg-slate-900/90 text-white dark:bg-linear-to-br dark:from-blue-50/95 dark:via-white/90 dark:to-blue-100/90 dark:text-slate-800 backdrop-blur-xl rounded-xl h-full flex flex-col justify-between overflow-hidden border border-cyan-500/30 dark:border-cyan-600/20 transition-all duration-300 ease-out hover:border-cyan-400 dark:hover:border-cyan-500 hover:ring-1 hover:ring-cyan-400 dark:hover:ring-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]">
        <div className="h-1.5 w-full bg-linear-to-r from-[#00c6ff] to-[#ff4b2b]"></div>

        <div className="p-4 flex flex-col h-full justify-between">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 dark:border-slate-200/50">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400 dark:from-blue-700 dark:to-purple-600">
                {lang === "en" ? "Group" : "Grupo"}{" "}
                {group.name.replace("Grupo ", "").replace("Group ", "")}
              </h3>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${saveStatus === "saving" ? "text-yellow-400 animate-pulse" : saveStatus === "saved" ? "text-green-400" : saveStatus === "error" ? "text-red-500" : "text-transparent"}`}
              >
                {saveStatus === "saving"
                  ? t.saving
                  : saveStatus === "saved"
                    ? t.saved
                    : saveStatus === "error"
                      ? t.error
                      : "."}
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              {group.id === "K" ? t.colombiaGroup : t.phase}
            </span>
          </div>

          <div className="space-y-1 mb-4">
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                editable={true}
                onScoreChange={handleScoreChange}
                lang={lang}
              />
            ))}
          </div>

          <GroupTable tableData={tableData} lang={lang} />
        </div>
      </div>
    </div>
  );
};
