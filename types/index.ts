// src/types/index.ts

export interface Team {
  name_es: string;
  name_en?: string;
  flag_code: string; // En tu DB se llama flag_code, no flagCode
}

export interface MatchReal {
  id: number;
  match_date: string; // En tu DB es match_date, no date
  stadium: string;
  city: string;
  home_score?: number | null;
  away_score?: number | null;
  home_team: Team; // En tu DB viene como objeto home_team
  away_team: Team;
}

export interface GroupDataReal {
  id: string;
  name: string;
  matches: MatchReal[];
}

export interface TableStats {
  team: string;
  pts: number;
  gf: number;
  gc: number;
  dg: number; // Diferencia de gol
  pos: number;
  isTied: boolean;
}
