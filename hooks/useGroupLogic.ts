// src/hooks/useGroupLogic.ts
import { useState, useEffect, useRef } from "react";
import { GroupDataReal, MatchReal, TableStats } from "@/types";
import { calculateStandings } from "@/utils/standings";
import {
  savePrediction,
  subscribeToGroupPredictions,
} from "@/services/predictionService";

// 🔥 IMPORTAMOS LA NUEVA ACCIÓN
import { saveGroupStandingsAction } from "@/lib/actions/fan-actions";

export const useGroupLogic = (
  group: GroupDataReal,
  lang: string,
  initialPredictions: any[],
) => {
  // 1. ESTADO DE LOS PARTIDOS
  const [matches, setMatches] = useState<MatchReal[]>(() => {
    return group.matches.map((match) => {
      const pred = initialPredictions.find((p) => p.match_id === match.id);
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

  // 2. OTROS ESTADOS
  const [tableData, setTableData] = useState<TableStats[]>([]);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const standingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ REF PARA EVITAR RESETS POR RE-RENDERS DEL PADRE
  const hasInitializedRef = useRef(false);

  // 🛡️ NUEVO REF: Evita guardar en DB si la tabla no ha cambiado
  const lastSavedStandingsRef = useRef<string>("");

  // 3. EFECTO: CARGAR SESIÓN
  useEffect(() => {
    const sessionStr = localStorage.getItem("polla_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setAdminUserId(session.id);
      setUserRole(session.role);
    }
    setIsReady(true);
  }, []);

  // 🛡️ EFECTO EXTRA: Sincronizar solo una vez si cambian las initialPredictions
  useEffect(() => {
    if (
      isReady &&
      !hasInitializedRef.current &&
      initialPredictions.length > 0
    ) {
      setMatches((prev) =>
        prev.map((m) => {
          const pred = initialPredictions.find((p) => p.match_id === m.id);
          return pred
            ? { ...m, home_score: pred.pred_home, away_score: pred.pred_away }
            : m;
        }),
      );
      hasInitializedRef.current = true;
    }
  }, [initialPredictions, isReady]);

  // 4. EFECTO: REALTIME (Con filtro de seguridad)
  useEffect(() => {
    if (!adminUserId) return;

    const unsubscribe = subscribeToGroupPredictions(
      group.id,
      adminUserId,
      (newPrediction) => {
        if (!newPrediction || newPrediction.match_id === undefined) return;

        setMatches((prev) =>
          prev.map((m) => {
            if (m.id === newPrediction.match_id) {
              const hasChanged =
                m.home_score !== newPrediction.pred_home ||
                m.away_score !== newPrediction.pred_away;

              if (hasChanged) {
                return {
                  ...m,
                  home_score: newPrediction.pred_home,
                  away_score: newPrediction.pred_away,
                };
              }
            }
            return m;
          }),
        );
      },
    );

    return () => {
      unsubscribe();
    };
  }, [adminUserId, group.id]);

  // 5. EFECTO: CALCULAR TABLA Y AUTO-GUARDADO (Optimizado con huella digital)
  useEffect(() => {
    // 1. Siempre calculamos para que el usuario vea la tabla actualizada
    const newStandings = calculateStandings(matches, lang);
    setTableData(newStandings);

    if (adminUserId && isReady) {
      // 2. Creamos la "huella" de la tabla actual
      const currentStandingsStr = JSON.stringify(newStandings);

      // 3. Comparamos con la última guardada
      if (currentStandingsStr !== lastSavedStandingsRef.current) {
        if (standingsTimeoutRef.current)
          clearTimeout(standingsTimeoutRef.current);

        standingsTimeoutRef.current = setTimeout(async () => {
          // Guardamos solo si es diferente
          await saveGroupStandingsAction(adminUserId, group.id, newStandings);
          // Actualizamos la referencia
          lastSavedStandingsRef.current = currentStandingsStr;
        }, 2000);
      }
    }

    return () => {
      if (standingsTimeoutRef.current)
        clearTimeout(standingsTimeoutRef.current);
    };
  }, [matches, lang, adminUserId, isReady, group.id]);

  // 6. HANDLER: CAMBIO DE MARCADORES
  const handleScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);

    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return type === "home"
          ? { ...m, home_score: newVal }
          : { ...m, away_score: newVal };
      }
      return m;
    });
    setMatches(updatedMatches);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const matchToSave = updatedMatches.find((m) => m.id === matchId);
    if (matchToSave && adminUserId) {
      saveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await savePrediction(
            adminUserId,
            matchToSave.id,
            matchToSave.home_score ?? null,
            matchToSave.away_score ?? null,
          );
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 1000);
    }
  };

  // 7. HANDLER: GUARDAR DESEMPATE MANUAL
  const handleManualSort = async (updatedTable: TableStats[]) => {
    setTableData(updatedTable);
    if (adminUserId && isReady) {
      await saveGroupStandingsAction(adminUserId, group.id, updatedTable);
      // Actualizamos la referencia para que el efecto no intente guardar de nuevo lo mismo
      lastSavedStandingsRef.current = JSON.stringify(updatedTable);
    }
  };

  return {
    matches,
    tableData,
    saveStatus,
    userRole,
    isReady,
    handleScoreChange,
    handleManualSort,
  };
};
