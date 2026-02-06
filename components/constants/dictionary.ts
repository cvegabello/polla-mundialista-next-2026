// components/constants/dictionary.ts

export const DICTIONARY = {
  es: {
    phase: "Fase 1",
    colombiaGroup: "Grupo de Colombia",
    team: "Equipo",
    pts: "PTS",
    gf: "GF",
    gc: "GC",
    dg: "DG",
    dateLocale: "es-ES", // Para formatear fechas
    loading: "Cargando...",
    saving: "Guardando...",
    saved: "Guardado",
    error: "Error",
  },
  en: {
    phase: "Stage 1",
    colombiaGroup: "Colombia's Group",
    team: "Team",
    pts: "PTS",
    gf: "GF",
    gc: "GA", // Goals Against
    dg: "GD", // Goal Difference
    dateLocale: "en-US",
    loading: "Loading...",
    saving: "Saving...",
    saved: "Saved",
    error: "Error",
  },
};

export type Language = "es" | "en";
