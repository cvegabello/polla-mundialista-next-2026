import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  saveKnockoutPredictionAction,
  submitPredictionsAction,
  getUserStandingsAction,
  saveGroupStandingsAction,
  saveGroupBulkPredictionsAction,
} from "@/lib/actions/fan-actions";
import { resolveBracketMatches } from "@/utils/bracket-resolver";

export const useFanDashboardLogic = (
  initialPredictions: any[],
  userId: string,
) => {
  const [currentView, setCurrentView] = useState("pred_groups");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedMatches, setCompletedMatches] = useState<Set<string>>(
    new Set(),
  );
  const [showFloating, setShowFloating] = useState(false);

  const [bracketMatches, setBracketMatches] = useState<any[]>([]);
  const [isLoadingBracket, setIsLoadingBracket] = useState(false);
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, any>>(
    {},
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const unsavedPredictions = useRef<Record<string, any>>({});

  // 🚀 ACTUALIZADO: NUEVOS ESTADOS DE UI
  const [systemModal, setSystemModal] = useState<
    "none" | "refresh" | "logout" | "success" | "autosaving" | "autosaved"
  >("none");
  const logoutActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (initialPredictions && initialPredictions.length > 0) {
      const validIds = new Set<string>();
      initialPredictions.forEach((p) => {
        const isComplete =
          p.home_score !== null &&
          p.home_score !== undefined &&
          p.away_score !== null &&
          p.away_score !== undefined;
        if (isComplete) validIds.add(p.match_id.toString());
      });
      setCompletedMatches(validIds);
    }
  }, [initialPredictions]);

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

  useEffect(() => {
    const loadBracket = async () => {
      if (currentView === "pred_finals" && userId) {
        setIsLoadingBracket(true);
        try {
          const standings = await getUserStandingsAction(userId);
          const resolved = resolveBracketMatches(standings, initialPredictions);
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

  const handlePredictionChange = useCallback(
    (matchId: string, isComplete: boolean) => {
      setHasUnsavedChanges(true);
      setCompletedMatches((prev) => {
        const hasMatch = prev.has(matchId);
        if (isComplete && hasMatch) return prev;
        if (!isComplete && !hasMatch) return prev;
        const newSet = new Set(prev);
        if (isComplete) newSet.add(matchId);
        else newSet.delete(matchId);
        return newSet;
      });
    },
    [],
  );

  const handleAdvanceTeam = useCallback(
    (matchId: number | string, winnerData: any) => {
      setHasUnsavedChanges(true);
      setKnockoutWinners((prev) => ({
        ...prev,
        [matchId.toString()]: winnerData,
      }));
    },
    [],
  );

  // 🚀 MAGIA PURA: SABE SI ES MANUAL O AUTOMÁTICO
  const handleManualSave = async (isAutoSave: boolean = false) => {
    if (!hasUnsavedChanges || !userId) return;

    // Si es automático, mostramos el UI de "Guardando automáticamente..."
    if (isAutoSave) {
      setSystemModal("autosaving");
    }

    try {
      for (const key in unsavedPredictions.current) {
        const data = unsavedPredictions.current[key];
        if (data.isKnockout) {
          await saveKnockoutPredictionAction(
            userId,
            key,
            data.hScore,
            data.aScore,
            data.winnerId,
          );
        } else {
          if (data.matches) {
            const bulkData = data.matches.map((m: any) => ({
              matchId: m.id,
              hScore: m.home_score ?? null,
              aScore: m.away_score ?? null,
            }));
            await saveGroupBulkPredictionsAction(userId, bulkData);
          }
          if (data.tableData) {
            await saveGroupStandingsAction(userId, key, data.tableData);
          }
        }
      }

      unsavedPredictions.current = {};
      setHasUnsavedChanges(false);

      // Decidimos cuál mensajito de éxito mostrar
      setSystemModal(isAutoSave ? "autosaved" : "success");
      setTimeout(() => setSystemModal("none"), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      if (isAutoSave) setSystemModal("none"); // Ocultamos el spinner si falla
    }
  };

  const handleRefresh = () => {
    if (hasUnsavedChanges) {
      setSystemModal("refresh");
    } else {
      window.location.reload();
    }
  };

  const handleLogoutAttempt = (executeLogout: () => void) => {
    if (hasUnsavedChanges) {
      logoutActionRef.current = executeLogout;
      setSystemModal("logout");
    } else {
      executeLogout();
    }
  };

  const confirmRefresh = () => window.location.reload();
  const closeSystemModal = () => setSystemModal("none");
  const proceedWithLogout = async (saveFirst: boolean) => {
    if (saveFirst) {
      await handleManualSave();
    }
    if (logoutActionRef.current) {
      logoutActionRef.current();
    }
  };

  // ⏱️ TEMPORIZADOR INTELIGENTE DE 5 MINUTOS (Le pasa true a la función)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleManualSave(true); // 👈 Dispara como autoguardado
      }
    }, 300000); // 5 minutos

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges]);

  const handleSubmit = async () => {
    if (isSubmitting || hasSubmitted) return;
    if (!userId) return alert("Error: No se identifica el usuario.");

    setIsSubmitting(true);
    try {
      const result = await submitPredictionsAction(userId);
      if (result.success) {
        setHasSubmitted(true);
        setHasUnsavedChanges(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#eab308", "#ffffff"],
          zIndex: 9999,
        });
      } else {
        alert("Hubo un problema: " + (result as any).error);
      }
    } catch (err) {
      console.error(err);
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
      setHasUnsavedChanges(true);
      unsavedPredictions.current[matchId] = {
        isKnockout: true,
        hScore,
        aScore,
        winnerId,
      };
    },
    [],
  );

  const handleGroupDataChange = useCallback(
    (groupId: string, matches: any[], tableData: any[]) => {
      setHasUnsavedChanges(true);
      unsavedPredictions.current[groupId] = { matches, tableData };
    },
    [],
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
    knockoutWinners,
    handleAdvanceTeam,
    handleSaveKnockoutPrediction,
    hasUnsavedChanges,
    handleManualSave,
    handleRefresh,
    handleGroupDataChange,

    // UI Modales
    systemModal,
    closeSystemModal,
    confirmRefresh,
    proceedWithLogout,
    handleLogoutAttempt,
  };
};
