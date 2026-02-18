// src/types/index.ts

export interface Team {
  id: string; // 👈 ¡OBLIGATORIO! (Le quitamos el signo de interrogación)
  name_es: string;
  name_en?: string;
  flag_code: string;
}

export interface MatchReal {
  id: number;
  match_date: string;
  stadium: string;
  city: string;
  home_score?: number | null;
  away_score?: number | null;
  home_team: Team;
  away_team: Team;
  // 👇 Estos son obligatorios para que MatchRow no se queje
  home_team_id: string;
  away_team_id: string;
}

export interface GroupDataReal {
  id: string;
  name: string;
  matches: MatchReal[];
}

export interface TableStats {
  teamId: string; // 👈 Obligatorio también
  team: string;
  pts: number;
  gf: number;
  gc: number;
  dg: number;
  pos: number;
  isTied: boolean;
  played: number;
  won: number;
  tied: number;
  lost: number;
}
