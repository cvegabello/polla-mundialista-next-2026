// src/components/constants/dictionary.ts

export type Language = "es" | "en";

export const DICTIONARY = {
  es: {
    // ... (Lo que ya tenía de GroupCard: saving, saved, error, team, pts, etc.)
    saving: "Guardando...",
    saved: "Guardado",
    error: "Error",
    team: "Equipo",
    pts: "Pts",
    gf: "GF",
    gc: "GC",
    dg: "DG",
    colombiaGroup: "Grupo de Colombia",
    usaGroup: "Grupo de USA",
    phase: "Fase 1",

    // 👇 NUEVOS TEXTOS PARA EL DASHBOARD
    hello: "Hola",
    yourPredictions: "Tus Predicciones",
    logout: "Cerrar Sesión",
    appTitle: "Mi Polla Mundialista 2026",
    loadingGroups: "Trayendo los grupos...",
    adminZone: "Zona Admin",
    exit: "Salir",
    manageGroup: "Gestiona este grupo desde el panel principal.",
    adminView: "Vista de Admin",
  },
  en: {
    // ... (Lo que ya tenía)
    saving: "Saving...",
    saved: "Saved",
    error: "Error",
    team: "Team",
    pts: "Pts",
    gf: "GF",
    gc: "GA", // Goals Against
    dg: "GD", // Goal Difference
    colombiaGroup: "Colombia's Group",
    usaGroup: "USA's Group",
    phase: "Stage 1",

    // 👇 NUEVOS TEXTOS PARA EL DASHBOARD
    hello: "Hello",
    yourPredictions: "Your Predictions",
    logout: "Log Out",
    appTitle: "World Cup Pool 2026",
    loadingGroups: "Loading groups...",
    adminZone: "Admin Zone",
    exit: "Exit",
    manageGroup: "Manage this group from the main dashboard.",
    adminView: "Admin View",
  },
};
