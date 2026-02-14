import { useState, useEffect, useCallback } from "react";
// 👇 Importar la acción que acabamos de crear
import { submitPredictionsAction } from "@/lib/actions/fan-actions";
import confetti from "canvas-confetti";

export const useFanDashboardLogic = (
  initialPredictions: any[],
  userId: string,
) => {
  // 1. ESTADO DE LA VISTA (Grupos vs Finales)
  const [currentView, setCurrentView] = useState("pred_groups");

  // 👇 ESTADOS DE ENVÍO
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // 2. ESTADO DEL CONTADOR EN VIVO
  // Usamos un Set para guardar IDs únicos de partidos listos
  const [completedMatches, setCompletedMatches] = useState<Set<string>>(
    new Set(),
  );

  // 3. ESTADO PARA LA BARRA FLOTANTE (Scroll)
  const [showFloating, setShowFloating] = useState(false);

  // EFECTO 1: Cargar predicciones iniciales (CORREGIDO)
  useEffect(() => {
    if (initialPredictions && initialPredictions.length > 0) {
      const validIds = new Set<string>();

      initialPredictions.forEach((p) => {
        // 👇 AQUÍ ESTÁ LA CLAVE: Validamos que tenga goles antes de contarla
        const isComplete =
          p.home_score !== null &&
          p.home_score !== undefined &&
          p.away_score !== null &&
          p.away_score !== undefined;

        if (isComplete) {
          validIds.add(p.match_id.toString()); // Aseguramos que sea string
        }
      });

      setCompletedMatches(validIds);
    }
  }, [initialPredictions]);

  // EFECTO 2: Detectar Scroll (Optimizado)
  useEffect(() => {
    let ticking = false; // Bandera para no saturar

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          // Solo actualizamos el estado si es diferente (evita re-renders innecesarios)
          setShowFloating((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // CAMBIO: Envolvemos en useCallback
  const handlePredictionChange = useCallback(
    (matchId: string, isComplete: boolean) => {
      setCompletedMatches((prev) => {
        // Optimizamos: Si ya tiene el estado correcto, no hacemos nada (evita re-render)
        const hasMatch = prev.has(matchId);
        if (isComplete && hasMatch) return prev; // Ya estaba completo, no cambie nada
        if (!isComplete && !hasMatch) return prev; // Ya estaba incompleto, no cambie nada

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
  ); // Dependencias vacías = La función nunca cambia

  // 👇 LÓGICA DE ENVÍO FINAL
  const handleSubmit = async () => {
    // 1. Candado de seguridad
    if (isSubmitting || hasSubmitted) return;
    if (!userId) {
      alert("Error: No se identifica el usuario.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. LLAMADA AL SERVIDOR (A la tabla 'profiles')
      const result = await submitPredictionsAction(userId);

      if (result.success) {
        // --- ÉXITO ---

        // a. Bloqueo inmediato visual
        setHasSubmitted(true);

        // b. Scroll suave arriba
        window.scrollTo({ top: 0, behavior: "smooth" });

        // c. CONFETI (Celebración) 🎉
        // Tiro central
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#eab308", "#ffffff"], // Verde, Oro, Blanco
          zIndex: 9999,
        });

        // Tiros laterales (más fiesta)
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
  const totalMatches = 72; // Fase de grupos
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
  };
};
