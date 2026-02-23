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
  groupsData: any[] = [],
) => {
  const [currentView, setCurrentView] = useState("pred_groups");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedMatches, setCompletedMatches] = useState<Set<string>>(
    new Set(),
  );
  const [showFloating, setShowFloating] = useState(false);
  const [totalGroupMatches, setTotalGroupMatches] = useState(72);
  const [bracketMatches, setBracketMatches] = useState<any[]>([]);
  const [isLoadingBracket, setIsLoadingBracket] = useState(false);
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, any>>(
    {},
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const unsavedPredictions = useRef<Record<string, any>>({});

  const [systemModal, setSystemModal] = useState<
    "none" | "refresh" | "logout" | "success" | "autosaving" | "autosaved"
  >("none");
  const logoutActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const groupMatchIds = new Set<string>();
    let count = 0;
    if (groupsData && groupsData.length > 0) {
      groupsData.forEach((group) => {
        if (group.id !== "FI" && group.matches) {
          group.matches.forEach((m: any) => {
            groupMatchIds.add(m.id.toString());
            count++;
          });
        }
      });
      if (count > 0) setTotalGroupMatches(count);
    }

    if (initialPredictions && initialPredictions.length > 0) {
      const validIds = new Set<string>();
      initialPredictions.forEach((p) => {
        const isValidScore = (val: any) =>
          val !== null &&
          val !== undefined &&
          val !== "" &&
          (typeof val !== "string" || val.trim() !== "");
        const isComplete =
          isValidScore(p.pred_home) && isValidScore(p.pred_away);
        if (isComplete) {
          const matchIdStr = p.match_id.toString();
          if (groupMatchIds.size === 0 || groupMatchIds.has(matchIdStr)) {
            validIds.add(matchIdStr);
          }
        }
      });
      setCompletedMatches(validIds);
    }
  }, [initialPredictions, groupsData]);

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
      console.log("DEBUG: Activado desde handlePredictionChange");
      // setHasUnsavedChanges(true);
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
      setKnockoutWinners((prev) => ({
        ...prev,
        [matchId.toString()]: winnerData,
      }));
    },
    [],
  );

  // 🛠️ FUNCIÓN ACTUALIZADA: Agregamos forceClean para resetear el botón sin guardar de nuevo
  const handleManualSave = async (
    isAutoSave: boolean = false,
    forceClean: boolean = false,
  ) => {
    // Si forceClean es true, vaciamos las referencias y apagamos el flag de cambios
    if (forceClean) {
      unsavedPredictions.current = {};
      setHasUnsavedChanges(false);
      return;
    }

    if (!hasUnsavedChanges || !userId) return;
    if (isAutoSave) setSystemModal("autosaving");

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
      setSystemModal(isAutoSave ? "autosaved" : "success");
      setTimeout(() => setSystemModal("none"), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      if (isAutoSave) setSystemModal("none");
    }
  };

  const handleRefresh = () => {
    if (hasUnsavedChanges) setSystemModal("refresh");
    else window.location.reload();
  };

  const handleLogoutAttempt = (executeLogout: () => void) => {
    if (hasUnsavedChanges) {
      logoutActionRef.current = executeLogout;
      setSystemModal("logout");
    } else executeLogout();
  };

  const confirmRefresh = () => window.location.reload();
  const closeSystemModal = () => setSystemModal("none");
  const proceedWithLogout = async (saveFirst: boolean) => {
    if (saveFirst) await handleManualSave();
    if (logoutActionRef.current) logoutActionRef.current();
  };

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) handleManualSave(true);
    }, 300000);
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
      } else alert("Hubo un problema: " + (result as any).error);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveKnockoutPrediction = useCallback(
    async (
      matchId: string | number,
      hScore: number,
      aScore: number,
      winnerId: string,
    ) => {
      console.log("DEBUG: Activado desde handleSaveKnockoutPrediction");
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
      console.log("--- DEBUG NULL DETECTED ---");
      console.log("Grupo editado:", groupId);
      matches.forEach((m) => {
        console.log(
          `Partido ${m.id}: Home=${m.home_score} (Tipo: ${typeof m.home_score}), Away=${m.away_score} (Tipo: ${typeof m.away_score})`,
        );
      });
      console.log("DEBUG: Activado desde handleGroupDataChange");
      setHasUnsavedChanges(true);
      unsavedPredictions.current[groupId] = { matches, tableData };
    },
    [],
  );

  return {
    currentView,
    setCurrentView,
    completedMatches,
    progress: completedMatches.size,
    totalMatches: totalGroupMatches,
    isComplete: completedMatches.size >= totalGroupMatches,
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
    systemModal,
    closeSystemModal,
    confirmRefresh,
    proceedWithLogout,
    handleLogoutAttempt,
  };
};
