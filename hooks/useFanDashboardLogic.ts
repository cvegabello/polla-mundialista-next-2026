import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation"; // 🚀 NUEVO: Importamos el enrutador
import confetti from "canvas-confetti";
import {
  R32_MATCHUPS,
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";
import {
  saveKnockoutTeamsAction,
  saveKnockoutPredictionAction,
  submitPredictionsAction,
  getUserStandingsAction,
  saveGroupStandingsAction,
  saveGroupBulkPredictionsAction,
  submitKnockoutPhaseAction,
} from "@/lib/actions/fan-actions";
import { resolveBracketMatches } from "@/utils/bracket-resolver";

const ALL_MATCHUPS = [
  ...R32_MATCHUPS,
  ...R16_MATCHUPS,
  ...QF_MATCHUPS,
  ...SF_MATCHUPS,
  ...F_MATCHUPS,
];

export const useFanDashboardLogic = (
  initialPredictions: any[],
  userId: string,
  groupsData: any[] = [],
) => {
  const router = useRouter(); // 🚀 NUEVO: Inicializamos el router

  // 💾 MEJORA: Leemos la última pestaña visitada desde la memoria del navegador
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("fanDashboardView") || "pred_groups";
    }
    return "pred_groups";
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedMatches, setCompletedMatches] = useState<Set<string>>(
    new Set(),
  );
  const [showFloating, setShowFloating] = useState(false);
  const [totalGroupMatches, setTotalGroupMatches] = useState(72);
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

  const handlePredictionChange = useCallback(
    (matchId: string, isComplete: boolean) => {
      setCompletedMatches((prev) => {
        const hasMatch = prev.has(matchId);
        if (isComplete === hasMatch) return prev;

        setHasUnsavedChanges(true);

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

  const handleManualSave = async (
    isAutoSave: any = false,
    forceClean: boolean = false,
  ) => {
    const isReallyAutoSave = isAutoSave === true;

    if (forceClean) {
      unsavedPredictions.current = {};
      setHasUnsavedChanges(false);
      return;
    }

    if (!hasUnsavedChanges || !userId) return;
    if (isReallyAutoSave) setSystemModal("autosaving");

    try {
      let didUpdateGroups = false;

      // 1. Guardar en Base de Datos
      for (const key in unsavedPredictions.current) {
        const data = unsavedPredictions.current[key];
        if (data.isKnockout) {
          const hScore =
            data.hScore === "" || data.hScore === undefined
              ? null
              : data.hScore;
          const aScore =
            data.aScore === "" || data.aScore === undefined
              ? null
              : data.aScore;

          await saveKnockoutPredictionAction(
            userId,
            key,
            hScore,
            aScore,
            data.winnerId || null,
          );
        } else {
          if (data.matches) {
            const bulkData = data.matches.map((m: any) => ({
              matchId: m.id,
              hScore:
                m.home_score === "" || m.home_score === undefined
                  ? null
                  : m.home_score,
              aScore:
                m.away_score === "" || m.away_score === undefined
                  ? null
                  : m.away_score,
            }));
            await saveGroupBulkPredictionsAction(userId, bulkData);
          }
          if (data.tableData) {
            await saveGroupStandingsAction(userId, key, data.tableData);
            didUpdateGroups = true;
          }
        }
      }

      // 🧠 LA MAGIA: Calculamos la llave y la guardamos en BD al instante
      if (didUpdateGroups) {
        try {
          console.log(
            "⚽ Grupos actualizados. Auto-calculando llaves de fase final...",
          );
          const updatedStandings = await getUserStandingsAction(userId);
          const resolvedMatches = resolveBracketMatches(
            updatedStandings,
            knockoutWinners,
            ALL_MATCHUPS,
          );

          await saveKnockoutTeamsAction(userId, resolvedMatches);

          resolvedMatches.forEach((rm) => {
            const existing = initialPredictions.find(
              (p: any) => p.match_id?.toString() === rm.id?.toString(),
            );
            if (existing) {
              existing.predicted_home_team = rm.home?.id || null;
              existing.predicted_away_team = rm.away?.id || null;
            } else {
              initialPredictions.push({
                match_id: rm.id,
                predicted_home_team: rm.home?.id || null,
                predicted_away_team: rm.away?.id || null,
              });
            }
          });
        } catch (error) {
          console.error("❌ Error auto-calculando llaves:", error);
        }
      }

      // 2. Sincronizar memoria
      for (const key in unsavedPredictions.current) {
        const data = unsavedPredictions.current[key];
        if (data.isKnockout) {
          const existing = initialPredictions.find(
            (p: any) => p.match_id.toString() === key.toString(),
          );
          const hScore =
            data.hScore === "" || data.hScore === undefined
              ? null
              : data.hScore;
          const aScore =
            data.aScore === "" || data.aScore === undefined
              ? null
              : data.aScore;

          if (existing) {
            existing.pred_home = hScore;
            existing.pred_away = aScore;
            existing.predicted_winner = data.winnerId;
          } else {
            initialPredictions.push({
              match_id: key,
              pred_home: hScore,
              pred_away: aScore,
              predicted_winner: data.winnerId,
            });
          }
        } else if (data.matches) {
          data.matches.forEach((m: any) => {
            const existing = initialPredictions.find(
              (p: any) => p.match_id.toString() === m.id.toString(),
            );
            const mhScore =
              m.home_score === "" || m.home_score === undefined
                ? null
                : m.home_score;
            const maScore =
              m.away_score === "" || m.away_score === undefined
                ? null
                : m.away_score;

            if (existing) {
              existing.pred_home = mhScore;
              existing.pred_away = maScore;
            } else {
              initialPredictions.push({
                match_id: m.id,
                pred_home: mhScore,
                pred_away: maScore,
              });
            }
          });
        }
      }

      unsavedPredictions.current = {};
      setHasUnsavedChanges(false);

      // 🚀 MAGIA #1: Obligamos a Next.js a refrescar los datos silenciosamente
      router.refresh();

      setSystemModal(isReallyAutoSave ? "autosaved" : "success");
      setTimeout(() => setSystemModal("none"), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      if (isReallyAutoSave) setSystemModal("none");
    }
  };

  // 🥷 EL CAMBIO NINJA REFORZADO
  const handleViewChange = async (newView: string) => {
    if (newView !== currentView) {
      if (hasUnsavedChanges) {
        await handleManualSave(true);
      }
      setCurrentView(newView);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("fanDashboardView", newView);
      }

      // 🚀 MAGIA #2: Si el usuario entra a "Fase Final", refrescamos la BD en silencio
      if (newView === "pred_finals" || newView === "res_finals") {
        router.refresh();
      }
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

  const validateKnockoutPhase = (
    phase: string,
    phaseMatchIds: (string | number)[],
  ) => {
    let phaseName = "";
    if (phase === "r32") phaseName = "16avos de Final";
    else if (phase === "r16") phaseName = "Octavos de Final";
    else if (phase === "qf") phaseName = "Cuartos de Final";
    else if (phase === "sf") phaseName = "Semifinales";
    else if (phase === "f") phaseName = "Finales";

    let missing = 0;
    for (const mId of phaseMatchIds) {
      const pred = initialPredictions.find(
        (p: any) => p.match_id?.toString() === mId.toString(),
      );
      const unsaved = unsavedPredictions.current[mId];
      const hScore =
        unsaved && unsaved.hScore !== undefined
          ? unsaved.hScore
          : pred?.pred_home;
      const aScore =
        unsaved && unsaved.aScore !== undefined
          ? unsaved.aScore
          : pred?.pred_away;

      if (
        hScore === null ||
        hScore === undefined ||
        hScore === "" ||
        aScore === null ||
        aScore === undefined ||
        aScore === ""
      ) {
        missing++;
      }
    }

    if (missing > 0) {
      alert(
        `⚠️ ADUANA: Te faltan ${missing} partidos por llenar en los ${phaseName}. Complétalos todos antes de enviar.`,
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (
    phase?: string,
    phaseMatchIds?: (string | number)[],
    championId?: any,
  ) => {
    if (isSubmitting || hasSubmitted) return;
    if (!userId) return alert("Error: No se identifica el usuario.");

    if (hasUnsavedChanges) {
      await handleManualSave(true);
    }

    setIsSubmitting(true);
    try {
      const isKnockoutSubmission = phase === "r32";
      const phaseColumn = isKnockoutSubmission
        ? "sub_date_r32"
        : "sub_date_groups";

      console.log(
        `🚀 Iniciando envío de fase: ${phase || "groups"} en columna: ${phaseColumn}`,
      );

      const result = await submitPredictionsAction(
        userId,
        phaseColumn,
        championId,
      );

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

        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert("Error al enviar los pronósticos. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error en el proceso de envío:", error);
      alert("Ocurrió un error inesperado al procesar el envío.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveKnockoutPrediction = useCallback(
    async (
      matchId: string | number,
      hScore: any,
      aScore: any,
      winnerId: string | null,
    ) => {
      setHasUnsavedChanges(true);

      unsavedPredictions.current[matchId] = {
        isKnockout: true,
        hScore:
          hScore === "" || hScore === undefined || hScore === null
            ? null
            : hScore,
        aScore:
          aScore === "" || aScore === undefined || aScore === null
            ? null
            : aScore,
        winnerId: winnerId,
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
    setCurrentView: handleViewChange,
    completedMatches,
    progress: completedMatches.size,
    totalMatches: totalGroupMatches,
    isComplete: completedMatches.size >= totalGroupMatches,
    showFloating,
    handlePredictionChange,
    handleSubmit,
    validateKnockoutPhase,
    isSubmitting,
    hasSubmitted,
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
