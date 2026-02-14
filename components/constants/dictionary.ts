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

    // 👇 HEADER & DASHBOARD
    worldCupTitle: "COPA MUNDIAL 2026",
    statusDraft: "BORRADOR",
    statusOfficial: "OFICIAL",
    points: "Puntos",

    // MENÚ ACCIONES
    menuPositions: "Posiciones de la Polla",
    menuThirds: "Mejores 3ros",
    menuExit: "Salir",

    // CAJAS DE NAVEGACIÓN
    myPredictions: "MIS PRONÓSTICOS",
    officialResults: "RESULTADOS FIFA",
    btnGroups: "Fase de Grupos",
    btnFinals: "Fase Final",

    // ZONA DE ENVÍO
    submitButton: "ENVIAR OFICIALMENTE",
    submittedLabel: "PRONÓSTICOS ENVIADOS",
    submitWarning: "Completa los 48 partidos de grupos para enviar.",

    // TÍTULOS DE SECCIÓN
    viewPredGroups: "Mis Pronósticos - Fase de Grupos",
    viewPredFinals: "Mis Pronósticos - Fase Final",
    viewResGroups: "Resultados Oficiales - Fase de Grupos",
    viewResFinals: "Resultados Oficiales - Fase Final",

    readyMsg: "¡Todo listo para enviar! 🚀",
    progressLabel: "Progreso:",
    floatingReady: "¡Listo! Subir a Enviar ⬆",
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

    // 👇 HEADER & DASHBOARD
    worldCupTitle: "WORLD CUP 2026",
    statusDraft: "DRAFT",
    statusOfficial: "OFFICIAL",
    points: "Points",

    // MENÚ ACCIONES
    menuPositions: "Pool Standings",
    menuThirds: "Best 3rds",
    menuExit: "Log Out",

    // CAJAS DE NAVEGACIÓN
    myPredictions: "MY PREDICTIONS",
    officialResults: "FIFA RESULTS",
    btnGroups: "Group Stage",
    btnFinals: "Knockout Stage",

    // ZONA DE ENVÍO
    submitButton: "SUBMIT OFFICIALLY",
    submittedLabel: "PREDICTIONS SUBMITTED",
    submitWarning: "Complete all 48 group matches to submit.",

    // TÍTULOS DE SECCIÓN
    viewPredGroups: "My Predictions - Group Stage",
    viewPredFinals: "My Predictions - Knockout Stage",
    viewResGroups: "Official Results - Group Stage",
    viewResFinals: "Official Results - Knockout Stage",

    readyMsg: "All set to submit! 🚀",
    progressLabel: "Progress:",
    floatingReady: "Ready! Scroll to Submit ⬆",
  },
};
