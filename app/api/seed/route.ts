import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  // Conexión Directa "Todoterreno"
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // 1. LIMPIEZA TOTAL (Borramos para no duplicar datos viejos)
  await supabase.from("matches").delete().neq("id", 0);
  await supabase.from("teams").delete().neq("flag_code", "x");
  await supabase.from("groups").delete().neq("id", "x");

  // -------------------------------------------------------
  // 2. LOS 12 GRUPOS OFICIALES (A - L)
  // -------------------------------------------------------
  const groupsData = [
    { id: "A", name: "Grupo A" },
    { id: "B", name: "Grupo B" },
    { id: "C", name: "Grupo C" },
    { id: "D", name: "Grupo D" },
    { id: "E", name: "Grupo E" },
    { id: "F", name: "Grupo F" },
    { id: "G", name: "Grupo G" },
    { id: "H", name: "Grupo H" },
    { id: "I", name: "Grupo I" },
    { id: "J", name: "Grupo J" },
    { id: "K", name: "Grupo K" },
    { id: "L", name: "Grupo L" },
  ];

  const { error: groupsError } = await supabase
    .from("groups")
    .upsert(groupsData);
  if (groupsError)
    return NextResponse.json(
      { error: "Error Grupos: " + groupsError.message },
      { status: 500 },
    );

  // -------------------------------------------------------
  // 3. LOS 48 EQUIPOS (Sorteo Oficial Dic 2025)
  // -------------------------------------------------------
  const teamsData = [
    // --- GRUPO A (Sede: México) ---
    { name_es: "México", name_en: "Mexico", flag_code: "mex", group_id: "A" }, //
    {
      name_es: "Sudáfrica",
      name_en: "South Africa",
      flag_code: "rsa",
      group_id: "A",
    },
    {
      name_es: "Corea del Sur",
      name_en: "South Korea",
      flag_code: "kor",
      group_id: "A",
    },
    {
      name_es: "Repechaje UEFA D",
      name_en: "Playoff UEFA D",
      flag_code: "uefa_rep_d",
      group_id: "A",
    }, //

    // --- GRUPO B (Sede: Canadá) ---
    { name_es: "Canadá", name_en: "Canada", flag_code: "can", group_id: "B" }, //
    {
      name_es: "Repechaje UEFA A",
      name_en: "Playoff UEFA A",
      flag_code: "uefa_rep_a",
      group_id: "B",
    },
    { name_es: "Catar", name_en: "Qatar", flag_code: "qat", group_id: "B" },
    {
      name_es: "Suiza",
      name_en: "Switzerland",
      flag_code: "sui",
      group_id: "B",
    },

    // --- GRUPO C ---
    { name_es: "Brasil", name_en: "Brazil", flag_code: "bra", group_id: "C" }, //
    {
      name_es: "Marruecos",
      name_en: "Morocco",
      flag_code: "mar",
      group_id: "C",
    },
    { name_es: "Haití", name_en: "Haiti", flag_code: "hai", group_id: "C" },
    {
      name_es: "Escocia",
      name_en: "Scotland",
      flag_code: "sco",
      group_id: "C",
    },

    // --- GRUPO D (Sede: USA) ---
    {
      name_es: "Estados Unidos",
      name_en: "USA",
      flag_code: "usa",
      group_id: "D",
    }, //
    {
      name_es: "Paraguay",
      name_en: "Paraguay",
      flag_code: "par",
      group_id: "D",
    },
    {
      name_es: "Australia",
      name_en: "Australia",
      flag_code: "aus",
      group_id: "D",
    },
    {
      name_es: "Repechaje UEFA C",
      name_en: "Playoff UEFA C",
      flag_code: "uefa_rep_c",
      group_id: "D",
    },

    // --- GRUPO E ---
    {
      name_es: "Alemania",
      name_en: "Germany",
      flag_code: "ger",
      group_id: "E",
    }, //
    { name_es: "Curazao", name_en: "Curaçao", flag_code: "cuw", group_id: "E" },
    {
      name_es: "Costa de Marfil",
      name_en: "Ivory Coast",
      flag_code: "civ",
      group_id: "E",
    },
    { name_es: "Ecuador", name_en: "Ecuador", flag_code: "ecu", group_id: "E" },

    // --- GRUPO F ---
    {
      name_es: "Países Bajos",
      name_en: "Netherlands",
      flag_code: "ned",
      group_id: "F",
    }, //
    { name_es: "Japón", name_en: "Japan", flag_code: "jpn", group_id: "F" },
    {
      name_es: "Repechaje UEFA B",
      name_en: "Playoff UEFA B",
      flag_code: "uefa_rep_b",
      group_id: "F",
    },
    { name_es: "Túnez", name_en: "Tunisia", flag_code: "tun", group_id: "F" },

    // --- GRUPO G ---
    { name_es: "Bélgica", name_en: "Belgium", flag_code: "bel", group_id: "G" }, //
    { name_es: "Egipto", name_en: "Egypt", flag_code: "egy", group_id: "G" },
    { name_es: "Irán", name_en: "Iran", flag_code: "irn", group_id: "G" },
    {
      name_es: "Nueva Zelanda",
      name_en: "New Zealand",
      flag_code: "nzl",
      group_id: "G",
    },

    // --- GRUPO H ---
    { name_es: "España", name_en: "Spain", flag_code: "esp", group_id: "H" }, //
    {
      name_es: "Cabo Verde",
      name_en: "Cape Verde",
      flag_code: "cpv",
      group_id: "H",
    },
    {
      name_es: "Arabia Saudita",
      name_en: "Saudi Arabia",
      flag_code: "ksa",
      group_id: "H",
    },
    { name_es: "Uruguay", name_en: "Uruguay", flag_code: "uru", group_id: "H" },

    // --- GRUPO I ---
    { name_es: "Francia", name_en: "France", flag_code: "fra", group_id: "I" }, //
    { name_es: "Senegal", name_en: "Senegal", flag_code: "sen", group_id: "I" },
    {
      name_es: "Repechaje FIFA 2",
      name_en: "Playoff FIFA 2",
      flag_code: "fifa_rep_2",
      group_id: "I",
    },
    { name_es: "Noruega", name_en: "Norway", flag_code: "nor", group_id: "I" },

    // --- GRUPO J ---
    {
      name_es: "Argentina",
      name_en: "Argentina",
      flag_code: "arg",
      group_id: "J",
    }, //
    { name_es: "Argelia", name_en: "Algeria", flag_code: "alg", group_id: "J" },
    { name_es: "Austria", name_en: "Austria", flag_code: "aut", group_id: "J" },
    { name_es: "Jordania", name_en: "Jordan", flag_code: "jor", group_id: "J" },

    // --- GRUPO K (¡Aquí está Colombia!) ---
    {
      name_es: "Portugal",
      name_en: "Portugal",
      flag_code: "por",
      group_id: "K",
    }, //
    {
      name_es: "Repechaje FIFA 1",
      name_en: "Playoff FIFA 1",
      flag_code: "fifa_rep_1",
      group_id: "K",
    },
    {
      name_es: "Uzbekistán",
      name_en: "Uzbekistan",
      flag_code: "uzb",
      group_id: "K",
    },
    {
      name_es: "Colombia",
      name_en: "Colombia",
      flag_code: "col",
      group_id: "K",
    },

    // --- GRUPO L ---
    {
      name_es: "Inglaterra",
      name_en: "England",
      flag_code: "eng",
      group_id: "L",
    }, //
    { name_es: "Croacia", name_en: "Croatia", flag_code: "cro", group_id: "L" },
    { name_es: "Ghana", name_en: "Ghana", flag_code: "gha", group_id: "L" },
    { name_es: "Panamá", name_en: "Panama", flag_code: "pan", group_id: "L" },
  ];

  // Insertar Equipos
  const { data: teamsDB, error: teamsError } = await supabase
    .from("teams")
    .upsert(teamsData, { onConflict: "flag_code" })
    .select();

  if (teamsError)
    return NextResponse.json(
      { error: "Error Equipos: " + teamsError.message },
      { status: 500 },
    );

  // Función auxiliar para obtener ID
  const getID = (code: string) =>
    teamsDB?.find((t) => t.flag_code === code)?.id;

  // -------------------------------------------------------
  // 4. PARTIDOS OFICIALES (Corregidos y Verificados)
  // -------------------------------------------------------
  const matchesData = [
    // --- JUEVES 11 DE JUNIO (Inauguración) ---
    {
      group_id: "A",
      home_team_id: getID("mex"),
      away_team_id: getID("rsa"), // Mexico vs Sudáfrica (Inaugural)
      match_date: "2026-06-11T20:00:00Z", // 3 PM Local
      stadium: "Estadio Azteca",
      city: "Mexico City",
    },
    {
      group_id: "A",
      home_team_id: getID("kor"),
      away_team_id: getID("uefa_rep_d"),
      match_date: "2026-06-12T03:00:00Z", // 10 PM Local
      stadium: "Estadio Akron",
      city: "Guadalajara",
    },

    // --- VIERNES 12 DE JUNIO ---
    {
      group_id: "B",
      home_team_id: getID("can"),
      away_team_id: getID("uefa_rep_a"),
      match_date: "2026-06-12T19:00:00Z",
      stadium: "BMO Field",
      city: "Toronto",
    },
    {
      group_id: "D",
      home_team_id: getID("usa"),
      away_team_id: getID("par"),
      match_date: "2026-06-13T01:00:00Z",
      stadium: "SoFi Stadium",
      city: "Los Angeles",
    },

    // --- SÁBADO 13 DE JUNIO ---
    {
      group_id: "C",
      home_team_id: getID("bra"),
      away_team_id: getID("mar"),
      match_date: "2026-06-13T18:00:00Z",
      stadium: "MetLife Stadium",
      city: "New York/NJ",
    },
    {
      group_id: "B",
      home_team_id: getID("qat"),
      away_team_id: getID("sui"),
      match_date: "2026-06-13T15:00:00Z",
      stadium: "Levi's Stadium",
      city: "San Francisco",
    },

    // --- DOMINGO 14 DE JUNIO ---
    {
      group_id: "E",
      home_team_id: getID("ger"),
      away_team_id: getID("cuw"),
      match_date: "2026-06-14T13:00:00Z",
      stadium: "NRG Stadium",
      city: "Houston",
    },
    {
      group_id: "E",
      home_team_id: getID("civ"),
      away_team_id: getID("ecu"),
      match_date: "2026-06-14T19:00:00Z",
      stadium: "Lincoln Financial Field",
      city: "Philadelphia",
    },

    // --- PARTIDOS DE COLOMBIA (GRUPO K) - ¡CORREGIDOS! ---
    {
      group_id: "K",
      home_team_id: getID("uzb"),
      away_team_id: getID("col"), // FECHA 1: Uzbekistán vs Colombia
      match_date: "2026-06-17T22:00:00Z",
      stadium: "Estadio Azteca",
      city: "Mexico City",
    },
    {
      group_id: "K",
      home_team_id: getID("col"),
      away_team_id: getID("fifa_rep_1"), // FECHA 2: Colombia vs Repechaje
      match_date: "2026-06-23T22:00:00Z",
      stadium: "Estadio Akron",
      city: "Guadalajara",
    },
    {
      // ¡AQUÍ ESTÁ LA CORRECCIÓN PARSE!
      group_id: "K",
      home_team_id: getID("col"), // Colombia es local administrativo
      away_team_id: getID("por"), // vs Portugal
      match_date: "2026-06-27T23:30:00Z", // 7:30 PM Hora Miami
      stadium: "Hard Rock Stadium", // ¡MIAMI CONFIRMADO!
      city: "Miami",
    },

    // --- OTROS CLAVES ---
    {
      group_id: "J",
      home_team_id: getID("arg"),
      away_team_id: getID("alg"),
      match_date: "2026-06-16T21:00:00Z",
      stadium: "Arrowhead Stadium",
      city: "Kansas City",
    },
    {
      group_id: "H",
      home_team_id: getID("esp"),
      away_team_id: getID("cpv"),
      match_date: "2026-06-15T12:00:00Z",
      stadium: "Mercedes-Benz Stadium",
      city: "Atlanta",
    },
  ];

  // Insertar Partidos
  const { error: matchesError } = await supabase
    .from("matches")
    .insert(matchesData);
  if (matchesError)
    return NextResponse.json(
      { error: "Error Matches: " + matchesError.message },
      { status: 500 },
    );

  return NextResponse.json({
    message: "✅ ¡Base de Datos Oficial 2026 cargada con éxito!",
    total_equipos: teamsDB?.length,
    total_partidos: matchesData.length,
  });
}
