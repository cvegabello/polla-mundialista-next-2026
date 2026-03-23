import { createClient } from "@supabase/supabase-js";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // --- 0. ZONA DE SEGURIDAD (CANDADO) 🔒 ---
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const MY_SECRET_KEY = process.env.SEED_SECRET;

  if (!MY_SECRET_KEY || secret !== MY_SECRET_KEY) {
    return NextResponse.json(
      { error: "⛔ Acceso Denegado: Contraseña incorrecta o faltante." },
      { status: 401 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    // 2. LIMPIEZA TOTAL
    await supabase.from("matches").delete().neq("id", 0);
    await supabase.from("teams").delete().neq("flag_code", "x");
    await supabase.from("groups").delete().neq("id", "x");

    // 3. LOS GRUPOS (Incluyendo el FI para las Fases Finales)
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
      { id: "FI", name: "Fases Finales" }, // 👈 El grupo para el Fan
    ];
    await supabase.from("groups").upsert(groupsData);

    // 4. LOS 48 EQUIPOS
    const teamsData = [
      // GRUPO A
      { name_es: "México", name_en: "Mexico", flag_code: "mex", group_id: "A" },
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
      },
      // GRUPO B
      { name_es: "Canadá", name_en: "Canada", flag_code: "can", group_id: "B" },
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
      // GRUPO C
      { name_es: "Brasil", name_en: "Brazil", flag_code: "bra", group_id: "C" },
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
      // GRUPO D
      {
        name_es: "Estados Unidos",
        name_en: "USA",
        flag_code: "usa",
        group_id: "D",
      },
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
      // GRUPO E
      {
        name_es: "Alemania",
        name_en: "Germany",
        flag_code: "ger",
        group_id: "E",
      },
      {
        name_es: "Curazao",
        name_en: "Curaçao",
        flag_code: "cuw",
        group_id: "E",
      },
      {
        name_es: "Costa de Marfil",
        name_en: "Ivory Coast",
        flag_code: "civ",
        group_id: "E",
      },
      {
        name_es: "Ecuador",
        name_en: "Ecuador",
        flag_code: "ecu",
        group_id: "E",
      },
      // GRUPO F
      {
        name_es: "Países Bajos",
        name_en: "Netherlands",
        flag_code: "ned",
        group_id: "F",
      },
      { name_es: "Japón", name_en: "Japan", flag_code: "jpn", group_id: "F" },
      {
        name_es: "Repechaje UEFA B",
        name_en: "Playoff UEFA B",
        flag_code: "uefa_rep_b",
        group_id: "F",
      },
      { name_es: "Túnez", name_en: "Tunisia", flag_code: "tun", group_id: "F" },
      // GRUPO G
      {
        name_es: "Bélgica",
        name_en: "Belgium",
        flag_code: "bel",
        group_id: "G",
      },
      { name_es: "Egipto", name_en: "Egypt", flag_code: "egy", group_id: "G" },
      { name_es: "Irán", name_en: "Iran", flag_code: "irn", group_id: "G" },
      {
        name_es: "Nueva Zelanda",
        name_en: "New Zealand",
        flag_code: "nzl",
        group_id: "G",
      },
      // GRUPO H
      { name_es: "España", name_en: "Spain", flag_code: "esp", group_id: "H" },
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
      {
        name_es: "Uruguay",
        name_en: "Uruguay",
        flag_code: "uru",
        group_id: "H",
      },
      // GRUPO I
      {
        name_es: "Francia",
        name_en: "France",
        flag_code: "fra",
        group_id: "I",
      },
      {
        name_es: "Senegal",
        name_en: "Senegal",
        flag_code: "sen",
        group_id: "I",
      },
      {
        name_es: "Repechaje FIFA 2",
        name_en: "Playoff FIFA 2",
        flag_code: "fifa_rep_2",
        group_id: "I",
      },
      {
        name_es: "Noruega",
        name_en: "Norway",
        flag_code: "nor",
        group_id: "I",
      },
      // GRUPO J
      {
        name_es: "Argentina",
        name_en: "Argentina",
        flag_code: "arg",
        group_id: "J",
      },
      {
        name_es: "Argelia",
        name_en: "Algeria",
        flag_code: "alg",
        group_id: "J",
      },
      {
        name_es: "Austria",
        name_en: "Austria",
        flag_code: "aut",
        group_id: "J",
      },
      {
        name_es: "Jordania",
        name_en: "Jordan",
        flag_code: "jor",
        group_id: "J",
      },
      // GRUPO K
      {
        name_es: "Portugal",
        name_en: "Portugal",
        flag_code: "por",
        group_id: "K",
      },
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
      // GRUPO L
      {
        name_es: "Inglaterra",
        name_en: "England",
        flag_code: "eng",
        group_id: "L",
      },
      {
        name_es: "Croacia",
        name_en: "Croatia",
        flag_code: "cro",
        group_id: "L",
      },
      { name_es: "Ghana", name_en: "Ghana", flag_code: "gha", group_id: "L" },
      { name_es: "Panamá", name_en: "Panama", flag_code: "pan", group_id: "L" },
    ];

    const { data: teamsDB, error: teamsError } = await supabase
      .from("teams")
      .upsert(teamsData, { onConflict: "flag_code" })
      .select();

    if (teamsError)
      return NextResponse.json(
        { error: "Error Equipos: " + teamsError.message },
        { status: 500 },
      );

    const getID = (code: string) =>
      teamsDB?.find((t) => t.flag_code === code)?.id;

    // 5. LOS 72 PARTIDOS DE GRUPOS EN BRUTO (Corregidos a UTC universal)
    const matchesData = [
      // GRUPO A
      {
        group_id: "A",
        home_team_id: getID("mex"),
        away_team_id: getID("rsa"),
        match_date: "2026-06-11T19:00:00+00:00",
        stadium: "Estadio Azteca",
        city: "Ciudad de México",
      },
      {
        group_id: "A",
        home_team_id: getID("kor"),
        away_team_id: getID("uefa_rep_d"),
        match_date: "2026-06-12T02:00:00+00:00",
        stadium: "Estadio Akron",
        city: "Zapopan",
      },
      {
        group_id: "A",
        home_team_id: getID("uefa_rep_d"),
        away_team_id: getID("rsa"),
        match_date: "2026-06-18T20:00:00+00:00",
        stadium: "Mercedes-Benz Stadium",
        city: "Atlanta",
      },
      {
        group_id: "A",
        home_team_id: getID("mex"),
        away_team_id: getID("kor"),
        match_date: "2026-06-19T01:00:00+00:00",
        stadium: "Estadio Akron",
        city: "Zapopan",
      },
      {
        group_id: "A",
        home_team_id: getID("uefa_rep_d"),
        away_team_id: getID("mex"),
        match_date: "2026-06-25T01:00:00+00:00",
        stadium: "Estadio Azteca",
        city: "Ciudad de México",
      },
      {
        group_id: "A",
        home_team_id: getID("rsa"),
        away_team_id: getID("kor"),
        match_date: "2026-06-25T01:00:00+00:00",
        stadium: "Estadio BBVA",
        city: "Guadalupe",
      },

      // GRUPO B
      {
        group_id: "B",
        home_team_id: getID("can"),
        away_team_id: getID("uefa_rep_a"),
        match_date: "2026-06-12T23:00:00+00:00",
        stadium: "BMO Field",
        city: "Toronto",
      },
      {
        group_id: "B",
        home_team_id: getID("qat"),
        away_team_id: getID("sui"),
        match_date: "2026-06-13T19:00:00+00:00",
        stadium: "Levi's Stadium",
        city: "Santa Clara",
      },
      {
        group_id: "B",
        home_team_id: getID("sui"),
        away_team_id: getID("uefa_rep_a"),
        match_date: "2026-06-18T19:00:00+00:00",
        stadium: "SoFi Stadium",
        city: "Inglewood",
      },
      {
        group_id: "B",
        home_team_id: getID("can"),
        away_team_id: getID("qat"),
        match_date: "2026-06-18T22:00:00+00:00",
        stadium: "BC Place",
        city: "Vancouver",
      },
      {
        group_id: "B",
        home_team_id: getID("sui"),
        away_team_id: getID("can"),
        match_date: "2026-06-24T19:00:00+00:00",
        stadium: "BC Place",
        city: "Vancouver",
      },
      {
        group_id: "B",
        home_team_id: getID("uefa_rep_a"),
        away_team_id: getID("qat"),
        match_date: "2026-06-24T19:00:00+00:00",
        stadium: "Lumen Field",
        city: "Seattle",
      },

      // GRUPO C
      {
        group_id: "C",
        home_team_id: getID("bra"),
        away_team_id: getID("mar"),
        match_date: "2026-06-13T22:00:00+00:00",
        stadium: "MetLife Stadium",
        city: "East Rutherford",
      },
      {
        group_id: "C",
        home_team_id: getID("hai"),
        away_team_id: getID("sco"),
        match_date: "2026-06-14T01:00:00+00:00",
        stadium: "Gillette Stadium",
        city: "Foxborough",
      },
      {
        group_id: "C",
        home_team_id: getID("sco"),
        away_team_id: getID("mar"),
        match_date: "2026-06-19T22:00:00+00:00",
        stadium: "Gillette Stadium",
        city: "Foxborough",
      },
      {
        group_id: "C",
        home_team_id: getID("bra"),
        away_team_id: getID("hai"),
        match_date: "2026-06-20T01:00:00+00:00",
        stadium: "Lincoln Financial Field",
        city: "Philadelphia",
      },
      {
        group_id: "C",
        home_team_id: getID("sco"),
        away_team_id: getID("bra"),
        match_date: "2026-06-24T22:00:00+00:00",
        stadium: "Hard Rock Stadium",
        city: "Miami Gardens",
      },
      {
        group_id: "C",
        home_team_id: getID("mar"),
        away_team_id: getID("hai"),
        match_date: "2026-06-24T22:00:00+00:00",
        stadium: "Mercedes-Benz Stadium",
        city: "Atlanta",
      },

      // GRUPO D
      {
        group_id: "D",
        home_team_id: getID("usa"),
        away_team_id: getID("par"),
        match_date: "2026-06-13T01:00:00+00:00",
        stadium: "SoFi Stadium",
        city: "Inglewood",
      },
      {
        group_id: "D",
        home_team_id: getID("aus"),
        away_team_id: getID("uefa_rep_c"),
        match_date: "2026-06-13T04:00:00+00:00",
        stadium: "BC Place",
        city: "Vancouver",
      },
      {
        group_id: "D",
        home_team_id: getID("uefa_rep_c"),
        away_team_id: getID("par"),
        match_date: "2026-06-19T04:00:00+00:00",
        stadium: "Levi's Stadium",
        city: "Santa Clara",
      },
      {
        group_id: "D",
        home_team_id: getID("usa"),
        away_team_id: getID("aus"),
        match_date: "2026-06-19T19:00:00+00:00",
        stadium: "Lumen Field",
        city: "Seattle",
      },
      {
        group_id: "D",
        home_team_id: getID("uefa_rep_c"),
        away_team_id: getID("usa"),
        match_date: "2026-06-26T02:00:00+00:00",
        stadium: "SoFi Stadium",
        city: "Inglewood",
      },
      {
        group_id: "D",
        home_team_id: getID("par"),
        away_team_id: getID("aus"),
        match_date: "2026-06-26T02:00:00+00:00",
        stadium: "Levi's Stadium",
        city: "Santa Clara",
      },

      // GRUPO E
      {
        group_id: "E",
        home_team_id: getID("ger"),
        away_team_id: getID("cuw"),
        match_date: "2026-06-14T17:00:00+00:00",
        stadium: "NRG Stadium",
        city: "Houston",
      },
      {
        group_id: "E",
        home_team_id: getID("civ"),
        away_team_id: getID("ecu"),
        match_date: "2026-06-14T23:00:00+00:00",
        stadium: "Lincoln Financial Field",
        city: "Philadelphia",
      },
      {
        group_id: "E",
        home_team_id: getID("ger"),
        away_team_id: getID("civ"),
        match_date: "2026-06-20T20:00:00+00:00",
        stadium: "BMO Field",
        city: "Toronto",
      },
      {
        group_id: "E",
        home_team_id: getID("cuw"),
        away_team_id: getID("ecu"),
        match_date: "2026-06-21T00:00:00+00:00",
        stadium: "Arrowhead Stadium",
        city: "Kansas City",
      },
      {
        group_id: "E",
        home_team_id: getID("ecu"),
        away_team_id: getID("ger"),
        match_date: "2026-06-25T20:00:00+00:00",
        stadium: "MetLife Stadium",
        city: "East Rutherford",
      },
      {
        group_id: "E",
        home_team_id: getID("cuw"),
        away_team_id: getID("civ"),
        match_date: "2026-06-25T20:00:00+00:00",
        stadium: "Lincoln Financial Field",
        city: "Philadelphia",
      },

      // GRUPO F
      {
        group_id: "F",
        home_team_id: getID("ned"),
        away_team_id: getID("jpn"),
        match_date: "2026-06-14T20:00:00+00:00",
        stadium: "AT&T Stadium",
        city: "Arlington",
      },
      {
        group_id: "F",
        home_team_id: getID("uefa_rep_b"),
        away_team_id: getID("tun"),
        match_date: "2026-06-15T02:00:00+00:00",
        stadium: "Estadio BBVA",
        city: "Guadalupe",
      },
      {
        group_id: "F",
        home_team_id: getID("ned"),
        away_team_id: getID("uefa_rep_b"),
        match_date: "2026-06-20T17:00:00+00:00",
        stadium: "NRG Stadium",
        city: "Houston",
      },
      {
        group_id: "F",
        home_team_id: getID("tun"),
        away_team_id: getID("jpn"),
        match_date: "2026-06-20T04:00:00+00:00",
        stadium: "Estadio BBVA",
        city: "Guadalupe",
      },
      {
        group_id: "F",
        home_team_id: getID("jpn"),
        away_team_id: getID("uefa_rep_b"),
        match_date: "2026-06-25T23:00:00+00:00",
        stadium: "AT&T Stadium",
        city: "Arlington",
      },
      {
        group_id: "F",
        home_team_id: getID("tun"),
        away_team_id: getID("ned"),
        match_date: "2026-06-25T23:00:00+00:00",
        stadium: "Arrowhead Stadium",
        city: "Kansas City",
      },

      // GRUPO G
      {
        group_id: "G",
        home_team_id: getID("bel"),
        away_team_id: getID("egy"),
        match_date: "2026-06-15T19:00:00+00:00",
        stadium: "Lumen Field",
        city: "Seattle",
      },
      {
        group_id: "G",
        home_team_id: getID("irn"),
        away_team_id: getID("nzl"),
        match_date: "2026-06-16T01:00:00+00:00",
        stadium: "SoFi Stadium",
        city: "Inglewood",
      },
      {
        group_id: "G",
        home_team_id: getID("bel"),
        away_team_id: getID("irn"),
        match_date: "2026-06-21T19:00:00+00:00",
        stadium: "SoFi Stadium",
        city: "Inglewood",
      },
      {
        group_id: "G",
        home_team_id: getID("nzl"),
        away_team_id: getID("egy"),
        match_date: "2026-06-22T01:00:00+00:00",
        stadium: "BC Place",
        city: "Vancouver",
      },
      {
        group_id: "G",
        home_team_id: getID("nzl"),
        away_team_id: getID("bel"),
        match_date: "2026-06-27T03:00:00+00:00",
        stadium: "BC Place",
        city: "Vancouver",
      },
      {
        group_id: "G",
        home_team_id: getID("egy"),
        away_team_id: getID("irn"),
        match_date: "2026-06-27T03:00:00+00:00",
        stadium: "Lumen Field",
        city: "Seattle",
      },

      // GRUPO H
      {
        group_id: "H",
        home_team_id: getID("esp"),
        away_team_id: getID("cpv"),
        match_date: "2026-06-15T16:00:00+00:00",
        stadium: "Mercedes-Benz Stadium",
        city: "Atlanta",
      },
      {
        group_id: "H",
        home_team_id: getID("ksa"),
        away_team_id: getID("uru"),
        match_date: "2026-06-15T22:00:00+00:00",
        stadium: "Hard Rock Stadium",
        city: "Miami Gardens",
      },
      {
        group_id: "H",
        home_team_id: getID("esp"),
        away_team_id: getID("ksa"),
        match_date: "2026-06-21T16:00:00+00:00",
        stadium: "Mercedes-Benz Stadium",
        city: "Atlanta",
      },
      {
        group_id: "H",
        home_team_id: getID("uru"),
        away_team_id: getID("cpv"),
        match_date: "2026-06-21T22:00:00+00:00",
        stadium: "Hard Rock Stadium",
        city: "Miami Gardens",
      },
      {
        group_id: "H",
        home_team_id: getID("uru"),
        away_team_id: getID("esp"),
        match_date: "2026-06-27T00:00:00+00:00",
        stadium: "Estadio BBVA",
        city: "Guadalajara",
      },
      {
        group_id: "H",
        home_team_id: getID("cpv"),
        away_team_id: getID("ksa"),
        match_date: "2026-06-27T00:00:00+00:00",
        stadium: "NRG Stadium",
        city: "Houston",
      },

      // GRUPO I
      {
        group_id: "I",
        home_team_id: getID("fra"),
        away_team_id: getID("sen"),
        match_date: "2026-06-16T19:00:00+00:00",
        stadium: "MetLife Stadium",
        city: "East Rutherford",
      },
      {
        group_id: "I",
        home_team_id: getID("fifa_rep_2"),
        away_team_id: getID("nor"),
        match_date: "2026-06-16T22:00:00+00:00",
        stadium: "Gillette Stadium",
        city: "Foxborough",
      },
      {
        group_id: "I",
        home_team_id: getID("fra"),
        away_team_id: getID("fifa_rep_2"),
        match_date: "2026-06-22T21:00:00+00:00",
        stadium: "Lincoln Financial Field",
        city: "Philadelphia",
      },
      {
        group_id: "I",
        home_team_id: getID("nor"),
        away_team_id: getID("sen"),
        match_date: "2026-06-23T00:00:00+00:00",
        stadium: "MetLife Stadium",
        city: "East Rutherford",
      },
      {
        group_id: "I",
        home_team_id: getID("nor"),
        away_team_id: getID("fra"),
        match_date: "2026-06-26T19:00:00+00:00",
        stadium: "Gillette Stadium",
        city: "Foxborough",
      },
      {
        group_id: "I",
        home_team_id: getID("sen"),
        away_team_id: getID("fifa_rep_2"),
        match_date: "2026-06-26T19:00:00+00:00",
        stadium: "BMO Field",
        city: "Toronto",
      },

      // GRUPO J
      {
        group_id: "J",
        home_team_id: getID("arg"),
        away_team_id: getID("alg"),
        match_date: "2026-06-17T01:00:00+00:00",
        stadium: "Arrowhead Stadium",
        city: "Kansas City",
      },
      {
        group_id: "J",
        home_team_id: getID("aut"),
        away_team_id: getID("jor"),
        match_date: "2026-06-16T04:00:00+00:00",
        stadium: "Levi's Stadium",
        city: "Santa Clara",
      },
      {
        group_id: "J",
        home_team_id: getID("arg"),
        away_team_id: getID("aut"),
        match_date: "2026-06-22T17:00:00+00:00",
        stadium: "AT&T Stadium",
        city: "Arlington",
      },
      {
        group_id: "J",
        home_team_id: getID("jor"),
        away_team_id: getID("alg"),
        match_date: "2026-06-23T03:00:00+00:00",
        stadium: "Levi's Stadium",
        city: "Santa Clara",
      },
      {
        group_id: "J",
        home_team_id: getID("jor"),
        away_team_id: getID("arg"),
        match_date: "2026-06-28T02:00:00+00:00",
        stadium: "AT&T Stadium",
        city: "Arlington",
      },
      {
        group_id: "J",
        home_team_id: getID("alg"),
        away_team_id: getID("aut"),
        match_date: "2026-06-28T02:00:00+00:00",
        stadium: "Arrowhead Stadium",
        city: "Kansas City",
      },

      // GRUPO K
      {
        group_id: "K",
        home_team_id: getID("por"),
        away_team_id: getID("fifa_rep_1"),
        match_date: "2026-06-17T17:00:00+00:00",
        stadium: "NRG Stadium",
        city: "Houston",
      },
      {
        group_id: "K",
        home_team_id: getID("uzb"),
        away_team_id: getID("col"),
        match_date: "2026-06-18T02:00:00+00:00",
        stadium: "Estadio Azteca",
        city: "Mexico City",
      },
      {
        group_id: "K",
        home_team_id: getID("por"),
        away_team_id: getID("uzb"),
        match_date: "2026-06-23T17:00:00+00:00",
        stadium: "NRG Stadium",
        city: "Houston",
      },
      {
        group_id: "K",
        home_team_id: getID("col"),
        away_team_id: getID("fifa_rep_1"),
        match_date: "2026-06-24T02:00:00+00:00",
        stadium: "Estadio Akron",
        city: "Zapopan",
      },
      {
        group_id: "K",
        home_team_id: getID("col"),
        away_team_id: getID("por"),
        match_date: "2026-06-27T23:30:00+00:00",
        stadium: "Hard Rock Stadium",
        city: "Miami Gardens",
      },
      {
        group_id: "K",
        home_team_id: getID("fifa_rep_1"),
        away_team_id: getID("uzb"),
        match_date: "2026-06-27T23:30:00+00:00",
        stadium: "Mercedes-Benz Stadium",
        city: "Atlanta",
      },

      // GRUPO L
      {
        group_id: "L",
        home_team_id: getID("eng"),
        away_team_id: getID("cro"),
        match_date: "2026-06-17T20:00:00+00:00",
        stadium: "AT&T Stadium",
        city: "Arlington",
      },
      {
        group_id: "L",
        home_team_id: getID("gha"),
        away_team_id: getID("pan"),
        match_date: "2026-06-17T23:00:00+00:00",
        stadium: "BMO Field",
        city: "Toronto",
      },
      {
        group_id: "L",
        home_team_id: getID("eng"),
        away_team_id: getID("gha"),
        match_date: "2026-06-23T20:00:00+00:00",
        stadium: "Gillette Stadium",
        city: "Foxborough",
      },
      {
        group_id: "L",
        home_team_id: getID("pan"),
        away_team_id: getID("cro"),
        match_date: "2026-06-23T23:00:00+00:00",
        stadium: "BMO Field",
        city: "Toronto",
      },
      {
        group_id: "L",
        home_team_id: getID("pan"),
        away_team_id: getID("eng"),
        match_date: "2026-06-27T21:00:00+00:00",
        stadium: "MetLife Stadium",
        city: "East Rutherford",
      },
      {
        group_id: "L",
        home_team_id: getID("cro"),
        away_team_id: getID("gha"),
        match_date: "2026-06-27T21:00:00+00:00",
        stadium: "Lincoln Financial Field",
        city: "Philadelphia",
      },
    ];

    // 🌟 6. ORDENAR CRONOLÓGICAMENTE Y ASIGNAR MATCH_NUMBER DEL 1 AL 72
    const sortedMatches = matchesData.sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    );

    const matchesWithNumber = sortedMatches.map((match, index) => ({
      ...match,
      match_number: index + 1, // 👈 Numeración oficial FIFA
    }));

    // 🏆 7. CREAR LOS CASCARONES DE LAS FASES FINALES (Partidos 73 al 104)
    const knockoutMatches = Array.from({ length: 32 }, (_, i) => ({
      match_number: 73 + i,
      group_id: "FI", // 👈 ¡EL SELLO MAESTRO PARA QUE EL FAN LOS VEA!
      home_team_id: null,
      away_team_id: null,
      // Fechas del futuro para evitar errores de ordenamiento
      match_date: new Date(
        new Date("2026-06-28").getTime() + i * 86400000,
      ).toISOString(),
      stadium: "Por definir",
      city: "Por definir",
    }));

    // 🤝 Juntamos los 72 de grupos + 32 de finales = 104 Partidos Completos
    const all104Matches = [...matchesWithNumber, ...knockoutMatches];

    // 8. Inserción Masiva de los 104 partidos
    const { error: matchesError } = await supabase
      .from("matches")
      .insert(all104Matches);

    if (matchesError)
      return NextResponse.json(
        { error: "Error Matches: " + matchesError.message },
        { status: 500 },
      );

    return NextResponse.json({
      message:
        "✅ ¡Operación Exitosa! Semilla recargada con los 104 partidos del Mundial numerados cronológicamente y Fases Finales listas.",
      matches_loaded: all104Matches.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
