import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { saveKnockoutPredictionAction } from "@/lib/actions/fan-actions";

// 👇 IMPORTAMOS LAS ACCIONES Y EL RESOLVER
import {
  submitPredictionsAction,
  getUserStandingsAction,
  saveKnockoutTeamsAction,
} from "@/lib/actions/fan-actions";
import { resolveBracketMatches } from "@/utils/bracket-resolver";

export const useFanDashboardLogic = (
  initialPredictions: any[],
  userId: string,
) => {
  // 1. ESTADO DE LA VISTA (Grupos vs Finales)
  const [currentView, setCurrentView] = useState("pred_groups");

  // 👇 ESTADOS DE ENVÍO
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // 2. ESTADO DEL CONTADOR EN VIVO (Para barra de progreso)
  const [completedMatches, setCompletedMatches] = useState<Set<string>>(
    new Set(),
  );

  // 3. ESTADO PARA LA BARRA FLOTANTE (Scroll)
  const [showFloating, setShowFloating] = useState(false);

  // 🚀 4. ESTADOS PARA EL BRACKET (Finales)
  const [bracketMatches, setBracketMatches] = useState<any[]>([]);
  const [isLoadingBracket, setIsLoadingBracket] = useState(false);

  // 🪄 5. NUEVO: ESTADO PARA EL EFECTO DOMINÓ (Memoria de Ganadores)
  // Guardará algo como: { '73': { name: 'Colombia', flag: 'co' }, '74': { ... } }
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, any>>(
    {},
  );

  // --- EFECTO 1: Cargar predicciones iniciales (Progreso) ---
  useEffect(() => {
    if (initialPredictions && initialPredictions.length > 0) {
      const validIds = new Set<string>();
      initialPredictions.forEach((p) => {
        const isComplete =
          p.home_score !== null &&
          p.home_score !== undefined &&
          p.away_score !== null &&
          p.away_score !== undefined;

        if (isComplete) {
          validIds.add(p.match_id.toString());
        }
      });
      setCompletedMatches(validIds);
    }
  }, [initialPredictions]);

  // --- EFECTO 2: Detectar Scroll ---
  useEffect(() => {
    let ticking = false;

    const handleScroll = (e: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = e.target as HTMLElement | Document;
          const scrollTop =
            target === document
              ? window.scrollY
              : (target as HTMLElement).scrollTop;

          const shouldShow = scrollTop > 150;
          setShowFloating((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  // 🚀 --- EFECTO 3: CARGAR Y RESOLVER BRACKET AL CAMBIAR VISTA ---
  useEffect(() => {
    const loadBracket = async () => {
      if (currentView === "pred_finals" && userId) {
        setIsLoadingBracket(true);
        try {
          // 1. Calculamos las posiciones actuales
          const standings = await getUserStandingsAction(userId);

          // 2. El algoritmo cruza los 1ros y 2dos y nos devuelve los partidos
          const resolved = resolveBracketMatches(standings);
          setBracketMatches(resolved);

          // 🪄 3. NUEVO: Auto-guardado silencioso de los equipos en la base de datos
          if (resolved.length > 0) {
            await saveKnockoutTeamsAction(userId, resolved);
          }
        } catch (error) {
          console.error("Error cargando el bracket:", error);
        } finally {
          setIsLoadingBracket(false);
        }
      }
    };

    loadBracket();
  }, [currentView, userId]);

  // --- HANDLER: Cambio de marcadores (Para el contador) ---
  const handlePredictionChange = useCallback(
    (matchId: string, isComplete: boolean) => {
      setCompletedMatches((prev) => {
        const hasMatch = prev.has(matchId);
        if (isComplete && hasMatch) return prev;
        if (!isComplete && !hasMatch) return prev;

        const newSet = new Set(prev);
        if (isComplete) {
          newSet.add(matchId);
        } else {
          newSet.delete(matchId);
        }
        return newSet;
      });
    },
    [],
  );

  // 🪄 NUEVO HANDLER: Avanzar un equipo a la siguiente ronda (Efecto Dominó)
  const handleAdvanceTeam = useCallback(
    (matchId: number | string, winnerData: any) => {
      setKnockoutWinners((prev) => {
        // Guardamos al equipo ganador usando el ID del partido como llave
        return {
          ...prev,
          [matchId.toString()]: winnerData,
        };
      });
    },
    [],
  );

  // --- LÓGICA DE ENVÍO FINAL ---
  const handleSubmit = async () => {
    if (isSubmitting || hasSubmitted) return;
    if (!userId) {
      alert("Error: No se identifica el usuario.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPredictionsAction(userId);
      if (result.success) {
        setHasSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#eab308", "#ffffff"],
          zIndex: 9999,
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } else {
        const errorMsg = (result as any).error || "Error desconocido";
        alert("Hubo un problema: " + errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMatches = 72;
  const progress = completedMatches.size;
  const isComplete = progress >= totalMatches;

  const handleSaveKnockoutPrediction = useCallback(
    async (
      matchId: string | number,
      hScore: number,
      aScore: number,
      winnerId: string,
    ) => {
      // 🕵️‍♂️ RASTREADOR 1: Verificamos qué sale de la tarjeta
      console.log("🔥 1. FRONTEND ENVIANDO:", {
        matchId,
        hScore,
        aScore,
        winnerId,
        userId,
      });

      if (userId) {
        const result = await saveKnockoutPredictionAction(
          userId,
          matchId,
          hScore,
          aScore,
          winnerId,
        );
        // 🕵️‍♂️ RASTREADOR 2: Verificamos qué respondió el servidor
        console.log("✅ 2. RESPUESTA DEL BACKEND:", result);
      } else {
        console.warn("❌ ALERTA: No hay userId, por eso no guarda.");
      }
    },
    [userId],
  );

  return {
    currentView,
    setCurrentView,
    completedMatches,
    progress,
    totalMatches,
    isComplete,
    showFloating,
    handlePredictionChange,
    handleSubmit,
    isSubmitting,
    hasSubmitted,
    bracketMatches,
    isLoadingBracket,
    // 🚀 EXPORTAMOS LAS NUEVAS ARMAS
    knockoutWinners,
    handleAdvanceTeam,
    handleSaveKnockoutPrediction,
  };
};
