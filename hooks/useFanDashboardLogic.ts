import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  saveKnockoutPredictionAction,
  submitPredictionsAction,
  getUserStandingsAction,
  saveGroupStandingsAction,
  saveGroupBulkPredictionsAction,
  submitKnockoutPhaseAction,
} from "@/lib/actions/fan-actions";
import { resolveBracketMatches } from "@/utils/bracket-resolver";

export const useFanDashboardLogic = (
  initialPredictions: any[],
  userId: string,
  groupsData: any[] = [],
) => {
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

  // 🚀 EL CARGADOR DE LLAVES (Con Interruptor Inteligente)
  useEffect(() => {
    const loadBracket = async () => {
      if (currentView === "pred_finals" && userId) {
        // 1. EL SENSOR: ¿El SuperAdmin ya inyectó equipos oficiales en 16avos?
        // Buscamos si en las predicciones ya hay equipos con UUID para los partidos 73 al 88 (o 383+).
        const isBracketSeeded = initialPredictions.some(
          (p: any) =>
            (p.match_id?.toString() === "73" ||
              p.match_id?.toString() === "383" ||
              Number(p.match_id) >= 73) &&
            p.pred_home !== undefined &&
            p.predicted_home_team !== null,
        );

        if (isBracketSeeded) {
          // 🏎️ MODO VISTA BRUTA (Turbo): Nos saltamos la base de datos.
          // Llamamos al resolver con un arreglo vacío solo para que nos escupa el "esqueleto" de los partidos.
          const emptyStandings: any[] = [];
          const resolved = resolveBracketMatches(
            emptyStandings,
            initialPredictions,
          );
          setBracketMatches(resolved);
          setIsLoadingBracket(false); // Ni siquiera encendemos el letrero
          return; // Abortamos el resto de la función
        }

        // 🐢 MODO CALCULADORA (El clásico): Si todavía estamos en Fase de Grupos, hace la matemática.
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
  }, [currentView, userId, initialPredictions]);

  const handlePredictionChange = useCallback(
    (matchId: string, isComplete: boolean) => {
      setCompletedMatches((prev) => {
        const hasMatch = prev.has(matchId);
        if (isComplete === hasMatch) return prev; // Ignorar si no hay cambio real

        setHasUnsavedChanges(true); // Activar botón solo si hubo cambio

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
      // 1. Guardar en Base de Datos
      for (const key in unsavedPredictions.current) {
        const data = unsavedPredictions.current[key];
        if (data.isKnockout) {
          // AJUSTE AQUÍ: Aseguramos que si es undefined o vacío, mande null
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
          }
        }
      }

      // 2. 🥷 Sincronizar memoria (Tu lógica original intacta)
      for (const key in unsavedPredictions.current) {
        const data = unsavedPredictions.current[key];
        if (data.isKnockout) {
          const existing = initialPredictions.find(
            (p: any) => p.match_id.toString() === key.toString(),
          );
          // Usamos la misma lógica de normalización para la memoria local
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

      setSystemModal(isReallyAutoSave ? "autosaved" : "success");
      setTimeout(() => setSystemModal("none"), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      if (isReallyAutoSave) setSystemModal("none");
    }
  };

  // 🥷 EL CAMBIO NINJA: Interceptamos el cambio de pestaña para guardar automáticamente
  // y memorizamos la pestaña en el navegador para que el Refresco no la borre.
  const handleViewChange = async (newView: string) => {
    if (newView !== currentView) {
      if (hasUnsavedChanges) {
        await handleManualSave(true);
      }
      setCurrentView(newView);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("fanDashboardView", newView);
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

  // 🚦 LA ADUANA BLINDADA
  // 🚦 LA ADUANA BLINDADA (V2 - Corregida con IDs Reales)
  // 🚦 LA ADUANA BLINDADA (V3 - Con Campeón del Mundo)
  const handleSubmit = async (
    phase?: string,
    phaseMatchIds?: (string | number)[],
    championId?: any, // 👈 NUEVO: Recibe el ID del campeón
  ) => {
    if (isSubmitting || hasSubmitted) return;
    if (!userId) return alert("Error: No se identifica el usuario.");

    if (hasUnsavedChanges) {
      await handleManualSave(true);
    }

    // 🚀 CASO 1: ENVÍO DE GRUPOS (Incluye el Campeón)
    if (!phase || phase === "groups") {
      setIsSubmitting(true);
      try {
        // 👇 AQUÍ LE MANDAMOS EL CAMPEÓN A LA BASE DE DATOS
        const result = await submitPredictionsAction(
          userId,
          "sub_date_groups",
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
          // Recargamos la página para que actualice la galleta y bloquee todo
          setTimeout(() => window.location.reload(), 1500);
        } else alert("Hubo un problema: " + (result as any).error);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
      return; // 👈 Salimos para que no intente ejecutar lo de las finales
    }

    // 🚀 CASO 2: FASES DE ELIMINATORIA (16avos, Octavos, etc.)
    if (phase && phaseMatchIds) {
      let phaseName = "";
      if (phase === "r32") phaseName = "16avos de Final";
      else if (phase === "r16") phaseName = "Octavos de Final";
      else if (phase === "qf") phaseName = "Cuartos de Final";
      else if (phase === "sf") phaseName = "Semifinales";
      else if (phase === "f") phaseName = "Finales";

      let missing = 0;

      // Inspeccionamos las cédulas exactas de los partidos
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

      // Si le faltan, le sacamos tarjeta amarilla y abortamos
      if (missing > 0) {
        alert(
          `⚠️ ADUANA: Te faltan ${missing} partidos por llenar en los ${phaseName}. Complétalos todos antes de enviar.`,
        );
        return;
      }

      // Si todo está lleno, sellamos la fase
      setIsSubmitting(true);
      try {
        const result = await submitKnockoutPhaseAction(userId, phase);
        if (result.success) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#22c55e", "#eab308", "#ffffff"],
            zIndex: 9999,
          });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          alert("Hubo un problema sellando la fase: " + result.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Busca esta función al final de useFanDashboardLogic.ts
  const handleSaveKnockoutPrediction = useCallback(
    async (
      matchId: string | number,
      hScore: any, // Aceptamos cualquier cosa para limpiar
      aScore: any,
      winnerId: string | null,
    ) => {
      setHasUnsavedChanges(true);

      // ✅ Normalizamos: si borran el input (""), guardamos null
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
    setCurrentView: handleViewChange, // 👈 Se reemplaza para interceptar clics
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
