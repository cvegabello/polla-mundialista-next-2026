// src/hooks/useGroupLogic.ts
import { useState, useEffect, useRef } from "react";
import { GroupDataReal, MatchReal, TableStats } from "@/types";
import { calculateStandings } from "@/utils/standings";
import {
  savePrediction,
  subscribeToGroupPredictions,
} from "@/services/predictionService";

export const useGroupLogic = (
  group: GroupDataReal,
  lang: string,
  initialPredictions: any[],
) => {
  // 1. ESTADO DE LOS PARTIDOS (Inicializado con props para evitar parpadeo)
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

  // 4. EFECTO: REALTIME (Suscripción a cambios)
  useEffect(() => {
    if (!adminUserId) return;

    const unsubscribe = subscribeToGroupPredictions(
      group.id,
      adminUserId,
      (newPrediction) => {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === newPrediction.match_id
              ? {
                  ...m,
                  home_score: newPrediction.pred_home,
                  away_score: newPrediction.pred_away,
                }
              : m,
          ),
        );
      },
    );

    return () => {
      unsubscribe();
    };
  }, [adminUserId, group.id]);

  // 5. EFECTO: CALCULAR TABLA
  useEffect(() => {
    setTableData(calculateStandings(matches, lang));
  }, [matches, lang]);

  // 6. HANDLER: GUARDAR EN BD
  const handleScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);

    // Actualización Optimista (Visual inmediata)
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return type === "home"
          ? { ...m, home_score: newVal }
          : { ...m, away_score: newVal };
      }
      return m;
    });
    setMatches(updatedMatches);

    // Guardado con Debounce (Espera a que deje de escribir)
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

  // Retornamos todo lo que la vista necesita
  return {
    matches,
    tableData,
    saveStatus,
    userRole,
    isReady,
    handleScoreChange,
  };
};
