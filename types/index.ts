// types/index.ts

export interface Team {
  id: number;
  name: string; // Aquí luego usaremos la traducción
  flagCode: string; // Para la banderita (ej: 'co', 'de')
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  homeScore?: number | null; // Puede ser null si no han jugado
  awayScore?: number | null;
}

export interface GroupData {
  name: string; // "Grupo A"
  matches: Match[];
  // Aquí iría la info de la tabla de posiciones calculada
}
