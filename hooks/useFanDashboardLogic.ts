import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

// 👇 IMPORTAMOS LAS ACCIONES Y EL RESOLVER
import {
  submitPredictionsAction,
  getUserStandingsAction,
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

  // 🚀 4. ESTADO PARA EL BRACKET (Finales)
  const [bracketMatches, setBracketMatches] = useState<any[]>([]);
  const [isLoadingBracket, setIsLoadingBracket] = useState(false);

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
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          setShowFloating((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🚀 --- EFECTO 3: CARGAR Y RESOLVER BRACKET AL CAMBIAR VISTA ---
  useEffect(() => {
    const loadBracket = async () => {
      if (currentView === "pred_finals" && userId) {
        setIsLoadingBracket(true);
        try {
          // A. Traemos las posiciones guardadas en 'user_group_standings'
          const standings = await getUserStandingsAction(userId);

          // B. Resolvemos quién juega contra quién (Traductor A1, B2, etc.)
          // Pasamos "es" como default, luego puede hacerlo dinámico
          const resolved = resolveBracketMatches(standings, "es");

          setBracketMatches(resolved);
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
        alert("Hubo un problema: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // VALORES COMPUTADOS
  const totalMatches = 72;
  const progress = completedMatches.size;
  const isComplete = progress >= totalMatches;

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
    // 🚀 EXPORTAMOS LOS NUEVOS ESTADOS DEL BRACKET
    bracketMatches,
    isLoadingBracket,
  };
};
