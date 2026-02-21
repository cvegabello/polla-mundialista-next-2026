// hooks/useBracketPersistence.ts
import { useState, useRef, useCallback } from "react";
import { savePrediction } from "@/services/predictionService";

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Hook que maneja el auto-guardado de pronósticos del bracket (fase de finales)
 * con debounce de 1s, idéntico al patrón de useGroupLogic para la fase de grupos.
 */
export const useBracketPersistence = (
  userId: string | undefined,
  initialPredictions: any[],
) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Devuelve los scores iniciales para una tarjeta a partir de las predicciones
   * cargadas desde la BD. matchId es un string numérico como "74", "89", etc.
   */
  const getInitialScores = useCallback(
    (matchId: string | number): { home: string; away: string } => {
      const pred = initialPredictions.find(
        (p) => p.match_id?.toString() === matchId?.toString(),
      );
      if (!pred) return { home: "", away: "" };
      const home =
        pred.pred_home !== null && pred.pred_home !== undefined
          ? pred.pred_home.toString()
          : "";
      const away =
        pred.pred_away !== null && pred.pred_away !== undefined
          ? pred.pred_away.toString()
          : "";
      return { home, away };
    },
    [initialPredictions],
  );

  /**
   * Guarda un pronóstico del bracket con debounce de 1s.
   * Al igual que en la fase de grupos, no requiere botón: se dispara automáticamente.
   */
  const handleBracketScoreChange = useCallback(
    (matchId: string | number, homeScore: string, awayScore: string) => {
      if (!userId) return;

      // Cancelar el guardado anterior si el usuario sigue escribiendo
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);

      const home = homeScore === "" ? null : parseInt(homeScore, 10);
      const away = awayScore === "" ? null : parseInt(awayScore, 10);

      // Solo guardamos si ambos campos tienen valor
      if (home === null || away === null) return;

      // Capturamos userId en local para el narrowing de TypeScript dentro del async callback
      const uid = userId;

      saveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await savePrediction(
            uid,
            parseInt(matchId.toString(), 10),
            home,
            away,
          );
          setSaveStatus("saved");
          // Volver a idle luego de 2s (similar a useGroupLogic)
          statusTimeoutRef.current = setTimeout(() => {
            setSaveStatus("idle");
          }, 2000);
        } catch (err) {
          console.error("Error guardando pronóstico del bracket:", err);
          setSaveStatus("error");
        }
      }, 1000);
    },
    [userId],
  );

  return {
    saveStatus,
    getInitialScores,
    handleBracketScoreChange,
  };
};
