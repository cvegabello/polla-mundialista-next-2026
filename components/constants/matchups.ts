// components/constants/matchups.ts

export const R32_MATCHUPS = [
  { id: "74", h: "E1", a: "T_ABCDF", info: "Boston (M74)" },
  { id: "77", h: "I1", a: "T_CDFGH", info: "New York/NJ (M77)" },
  { id: "73", h: "A2", a: "B2", info: "Los Angeles (M73)" },
  { id: "75", h: "F1", a: "C2", info: "Monterrey (M75)" },
  { id: "83", h: "K2", a: "L2", info: "Toronto (M83)" },
  { id: "84", h: "H1", a: "J2", info: "Los Angeles (M84)" },
  { id: "81", h: "D1", a: "T_BEFIJ", info: "San Francisco (M81)" },
  { id: "82", h: "G1", a: "T_AEHIJ", info: "Seattle (M82)" },
  { id: "76", h: "C1", a: "F2", info: "Houston (M76)" },
  { id: "78", h: "E2", a: "I2", info: "Dallas (M78)" },
  { id: "79", h: "A1", a: "T_CEFHI", info: "Mexico City (M79)" },
  { id: "80", h: "L1", a: "T_EHIJK", info: "Atlanta (M80)" },
  { id: "86", h: "J1", a: "H2", info: "Miami (M86)" },
  { id: "88", h: "D2", a: "G2", info: "Dallas (M88)" },
  { id: "85", h: "B1", a: "T_EFGIJ", info: "Vancouver (M85)" },
  { id: "87", h: "K1", a: "T_DEIJL", info: "Kansas City (M87)" },
];

// --- OCTAVOS DE FINAL (R16) ---
// OJO: Note que los números saltan (Ej: W74 vs W77). Así es el cuadro oficial.
export const R16_MATCHUPS = [
  // Lado Izquierdo del Cuadro (West/Central)
  { id: "89", h: "W74", a: "W77", info: "Octavos 1 (Philadelphia)" }, // 4 de Julio
  { id: "90", h: "W73", a: "W75", info: "Octavos 2 (Houston)" }, // 4 de Julio

  { id: "93", h: "W83", a: "W84", info: "Octavos 5 (Dallas)" }, // 6 de Julio
  { id: "94", h: "W81", a: "W82", info: "Octavos 6 (Seattle)" }, // 6 de Julio

  { id: "91", h: "W76", a: "W78", info: "Octavos 3 (New Jersey)" }, // 5 de Julio
  { id: "92", h: "W79", a: "W80", info: "Octavos 4 (Mexico City)" }, // 5 de Julio

  { id: "95", h: "W86", a: "W88", info: "Octavos 7 (Atlanta)" }, // 7 de Julio
  { id: "96", h: "W85", a: "W87", info: "Octavos 8 (Vancouver)" }, // 7 de Julio
];

// --- CUARTOS DE FINAL (QF) ---
// Se cruzan los ganadores de los Octavos definidos arriba
export const QF_MATCHUPS = [
  { id: "97", h: "W89", a: "W90", info: "Cuartos 1 (Boston)" }, // 9 de Julio
  { id: "98", h: "W93", a: "W94", info: "Cuartos 2 (Los Angeles)" }, // 10 de Julio

  { id: "99", h: "W91", a: "W92", info: "Cuartos 3 (Miami)" }, // 11 de Julio
  { id: "100", h: "W95", a: "W96", info: "Cuartos 4 (Kansas City)" }, // 11 de Julio
];

// --- SEMIFINALES (SF) ---
export const SF_MATCHUPS = [
  { id: "101", h: "W97", a: "W98", info: "Semifinal 1 (Dallas)" }, // 14 de Julio
  { id: "102", h: "W99", a: "W100", info: "Semifinal 2 (Atlanta)" }, // 15 de Julio
];

// --- FINAL Y 3ER PUESTO ---
export const F_MATCHUPS = [
  // La Gran Final (Ganador 101 vs Ganador 102)
  { id: "104", h: "W101", a: "W102", info: "GRAN FINAL (New York/NJ)" },

  // El 3er Puesto (Perdedor 101 vs Perdedor 102)
  // Usamos la 'L' que acabamos de programar
  { id: "103", h: "L101", a: "L102", info: "3er y 4to Puesto (Miami)" },
];
