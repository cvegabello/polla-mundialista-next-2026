// app/reglas/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { Language } from "@/components/constants/dictionary";
import { AppFooter } from "@/components/shared/AppFooter";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ReglasPage({ searchParams }: Props) {
  // Esperamos los parámetros de la URL (Next.js 15)
  const resolvedSearchParams = await searchParams;
  const urlLang = resolvedSearchParams?.lang;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("polla_session");

  let lang: Language = "es"; // Por defecto a español

  // 1. Verificamos si en la URL nos enviaron un idioma específico (?lang=en)
  if (urlLang === "en" || urlLang === "es") {
    lang = urlLang as Language;
  }
  // 2. Si no hay nada en la URL, miramos si el usuario ya tiene sesión guardada
  else if (sessionCookie) {
    try {
      const userSession = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (userSession.lang === "en" || userSession.lang === "es") {
        lang = userSession.lang as Language;
      }
    } catch (e) {
      console.error("Error parsing session cookie for rules page");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0b10] text-gray-200 py-10 px-4 md:px-10 lg:px-20">
      <div className="max-w-4xl mx-auto bg-[#0f1016] border border-orange-500/20 rounded-2xl p-6 md:p-12 shadow-2xl shadow-orange-900/20">
        {lang === "es" ? (
          // ==============================
          // REGLAMENTO EN ESPAÑOL
          // ==============================
          <div className="space-y-8">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mb-2">
              🏆 TiqueBet: Reglas Oficiales y Cómo Jugar
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              ¡Bienvenido a TiqueBet, la polla mundialista definitiva! Demuestra
              qué tanto sabes de fútbol, compite con tus amigos y llévate la
              gloria (y el premio). Aquí te explicamos cómo jugar y las reglas
              de la casa:
            </p>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-cyan-500/30 pb-2 mb-4">
                🎮 Cómo Jugar (El Tutorial)
              </h2>
              <ul className="space-y-3 list-none pl-0">
                <li>
                  <span className="text-amber-500 font-bold">
                    1. Simulación vs. Juego Real:
                  </span>{" "}
                  Puedes jugar y simular los resultados de todo el torneo hasta
                  la gran final para ver cómo quedarían tus cruces, pero{" "}
                  <strong>
                    en la primera etapa solo se jugarán y enviarán oficialmente
                    tus pronósticos de la Fase de Grupos
                  </strong>
                  .
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    2. Desbloqueo de Fases:
                  </span>{" "}
                  El torneo se juega por etapas. Las fases de eliminación
                  directe se irán desbloqueando unos días antes de su inicio,
                  únicamente cuando se conozcan los cruces oficiales.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    3. Actualización del Cuadro (¡Ojo al VAR!):
                  </span>{" "}
                  Una vez se confirmen los clasificados reales de cada fase,{" "}
                  <strong>
                    cualquier simulación previa que hayas hecho en el cuadro se
                    borrará
                  </strong>
                  . Deberás ingresar tus pronósticos definitivos basados en esos
                  cruces reales.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    4. Condition para Enviar:
                  </span>{" "}
                  Para que tus predicciones sean válidas, es obligatorio
                  ingresar los marcadores de <strong>TODOS</strong> los partidos
                  de esa ronda. Solo así se habilitará el botón de "Enviar
                  Pronósticos".
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    5. 🏆 Elige a tu Campeón:
                  </span>{" "}
                  El juego te pedirá que pronostiques quién levantará la copa en{" "}
                  <strong>dos momentos clave</strong>:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <em>La Primera Elección (Mayor Puntaje):</em> Al enviar
                      tus pronósticos de la Fase de Grupos.
                    </li>
                    <li>
                      <em>La Segunda Oportunidad (16avos de Final):</em> Antes
                      de que inicien los 16avos de final.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    6. 🎟️ Pronosticar no es participar:
                  </span>{" "}
                  <strong>No entrarás a jugar oficialmente</strong> si no haces
                  clic en el botón de "Enviar Pronósticos".
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    7. 🪄 El Botón Mágico (¡Haz crecer el pozo!):
                  </span>{" "}
                  Si quieres que el premio final sea una verdadera fortuna,
                  ¡trae a tu gente! En tu panel principal encontrarás un botón
                  de "Invitar". Úsalo libremente para retar a tus amigos o
                  familiares por WhatsApp, SMS o correo (en español o inglés).
                  ¡Entre más jugadores entren, más grande será el botín!
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    8. 📺 El VAR (Sigue la competencia en vivo):
                  </span>{" "}
                  El VAR es el corazón de la polla. Desde el menú principal
                  puedes acceder a esta sección para monitorear en tiempo real
                  cómo vas frente a tus rivales. El VAR cuenta con las
                  siguientes herramientas:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>🏆 Standings (Posiciones):</strong> La tabla
                      general. Aquí ves el ranking oficial, tus puntos totales y
                      el desglose exacto de dónde salieron esos puntos (cuántos
                      sumaste por marcadores exactos, cuántos por diferencia de
                      gol, y los bonos de grupo y de campeón).
                    </li>
                    <li>
                      <strong>📊 Matrix (La Matriz):</strong> ¡Aquí se acaban
                      los secretos! Podrás ver una cuadrícula detallada con
                      todos los participantes y los marcadores exactos que cada
                      jugador pronosticó para cada partido, comparados con el
                      resultado oficial de la FIFA.
                    </li>
                    <li>
                      <strong>📅 Filtro de Fechas:</strong> Por defecto, el VAR
                      te mostrará únicamente los partidos que se juegan en el
                      día actual ("Hoy") para que sigas la acción en vivo. Sin
                      embargo, cuentas con un menú desplegable donde puedes
                      seleccionar un día específico del calendario o elegir
                      "Todas las fechas" para ver el historial completo del
                      torneo.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    9. 📱 TiqueBet en tu Celular (Instala la App):
                  </span>{" "}
                  No necesitas buscar TiqueBet en una tienda de aplicaciones
                  para tenerla en tu teléfono. Puedes instalarla directamente
                  desde tu navegador en 10 segundos para jugar como una app
                  nativa:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>En Android (Chrome):</strong> Abre la página de la
                      polla, toca el menú de los tres puntitos (arriba a la
                      derecha) y selecciona "Instalar aplicación" o "Agregar a
                      la pantalla principal".
                    </li>
                    <li>
                      <strong>En iPhone (Safari):</strong> Abre la página de la
                      polla, toca el ícono de compartir (el cuadrito con la
                      flecha hacia arriba en la parte inferior) y selecciona
                      "Agregar a Inicio".
                    </li>
                  </ul>
                  <p className="mt-2 text-gray-400">
                    ¡Listo! Tendrás el escudo de TiqueBet en tu pantalla junto a
                    tus otras aplicaciones para entrar a pronosticar con un solo
                    toque.
                  </p>
                </li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-orange-400 border-b border-orange-500/30 pb-2 mb-4">
                📜 Las Reglas del Juego
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">💰</span> 1. La Inscripción (La
                    Apuesta)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    El valor de la entrada para participar en la polla es de{" "}
                    <strong>[VALOR POR DEFINIR]</strong>. Todo el dinero
                    recaudado irá a una bolsa de premios (el pozo) que se
                    repartirá al finalizar el torneo. De la siguiente manera: -
                    <strong>
                      80% al ganador - 15% al segundo lugar - 5% al tercer
                      lugar.
                    </strong>
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⏱️</span> 2. Fases Cerradas (¡El
                    tiempo es oro!)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    Es <strong>OBLIGATORIO</strong> enviar los pronósticos antes
                    de que ruede el balón en el primer partido de cada ronda. En
                    el momento en que inicia, esa etapa{" "}
                    <strong>SE CIERRA Y SE BLOQUEA</strong>.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> 3. Sistema de
                    Puntuación (¿Cómo se gana?)
                  </h3>
                  <p className="text-gray-400 mt-2 mb-3">
                    Los puntos no son acumulables por partido (se te asignará el
                    puntaje más alto que alcances):
                  </p>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    ⚽ Puntuación por Partido:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 mb-4">
                    <li>
                      <strong>Marcador Exacto:</strong> Si aciertas exactamente
                      el número de goles de ambos equipos, ganas{" "}
                      <strong>5 puntos</strong>.
                    </li>
                    <li>
                      <strong>Diferencia de Goles o Empate No Exacto:</strong>{" "}
                      Si aciertas el ganador y la diferencia exacta de goles, o
                      si aciertas un empate pero con otros goles, ganas{" "}
                      <strong>3 puntos</strong>.
                    </li>
                    <li>
                      <strong>Ganador Correcto:</strong> Si solo aciertas quién
                      ganó el partido, ganas <strong>1 punto</strong>.
                    </li>
                  </ul>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    🔥 Puntuación por Clasificados de Grupo:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 mb-4">
                    <li>
                      <strong>Primero y Segundo Exacto:</strong> Si aciertas qué
                      equipas clasifican como 1° y 2° en su orden correcto,{" "}
                      <strong>ganas 10 puntos.</strong>
                    </li>
                    <li>
                      <strong>Primero y Segundo Invertido:</strong> Si aciertas
                      los dos clasificados pero en el orden contrario, ganas{" "}
                      <strong>5 puntos.</strong>
                    </li>
                    <li>
                      <strong>Un Solo Clasificado:</strong> Si por lo menos
                      aciertas un equipo clasificado a la siguiente ronda, ganas{" "}
                      <strong>2 puntos.</strong>
                    </li>
                  </ul>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    👑 Puntuación por el Campeón del Mundo:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>
                      <strong>Campeón Inicial (Fase de Grupos):</strong> Si le
                      atinas al campeón desde tu primera elección, ganas{" "}
                      <strong>15 puntos.</strong>
                    </li>
                    <li>
                      <strong>Campeón de Segunda Oportunidad (16avos):</strong>{" "}
                      Si le atinas al campeón antes de los 16avos de final,
                      ganas <strong>8 puntos.</strong> (¡si es el mismo del
                      inicio, se suman ambos puntajes!).
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⚖️</span> 4. Criterio de
                    Desempate (¡El que pega primero, pega dos veces!)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    Si al finalizar el torneo dos o más participantes terminan
                    con exactamente la misma cantidad de puntos en el primer
                    lugar (o en puestos de premiación), el ganador definitivo
                    será el que haya enviado sus pronósticos de la Fase de
                    Grupos primero. El sistema registrará la fecha y hora exacta
                    de tu primer envío oficial antes de que ruede el balón en el
                    torneo. ¡No dejes tu tiquete para el último minuto!
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🛑</span> 5. Regla de Oro en
                    Eliminatorias (¡Los penales no cuentan!)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    Durante las fases de eliminación directa, el marcador
                    oficial que el sistema tendrá en cuenta para los puntos es
                    el resultado antes de la tanda de penales (es decir, el
                    marcador al término de los 90 minutos reglamentarios más el
                    tiempo extra, si lo hay). Si un partido termina 1-1 y se va
                    a penales, para el juego el resultado oficial es 1-1.
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          // ==============================
          // REGLAMENTO EN INGLÉS
          // ==============================
          <div className="space-y-8">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mb-2">
              🏆 TiqueBet: Official Rules & How to Play
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Welcome to TiqueBet, the ultimate World Cup prediction game! Show
              off your football knowledge, compete with friends, and claim the
              glory (and the prize). Here is how to play and the house rules:
            </p>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-cyan-500/30 pb-2 mb-4">
                🎮 How to Play (Tutorial)
              </h2>
              <ul className="space-y-3 list-none pl-0">
                <li>
                  <span className="text-amber-500 font-bold">
                    1. Simulation vs. Real Game:
                  </span>{" "}
                  You can play and simulate the results of the entire tournament
                  up to the grand final to see how your bracket would look, but{" "}
                  <strong>
                    initially, only your Group Stage predictions will be
                    officially submitted and played
                  </strong>
                  .
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    2. Unlocking Phases:
                  </span>{" "}
                  The tournament is played in stages. The knockout phases will
                  unlock a few days before they start, only after the official
                  real-life matchups are confirmed.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    3. Bracket Updates (VAR Check!):
                  </span>{" "}
                  Once the real qualified teams for each phase are confirmed,{" "}
                  <strong>
                    any previous simulations you made in the bracket will be
                    wiped clean
                  </strong>
                  . You must enter your final predictions based on those real
                  matchups.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    4. Submission Rule:
                  </span>{" "}
                  To make your predictions valid, it is mandatory to enter the
                  scores for <strong>ALL</strong> matches in that round. Only
                  then will the "Submit Predictions" button become enabled.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    5. 🏆 Pick Your Champion:
                  </span>{" "}
                  The game will ask you to predict who will lift the trophy at{" "}
                  <strong>two key moments</strong>:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <em>The First Pick (Highest Score):</em> Upon submitting
                      your Group Stage predictions.
                    </li>
                    <li>
                      <em>The Second Chance (Round of 32):</em> Before the Round
                      of 32 matchups begin.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    6. 🎟️ Predicting isn't participating:
                  </span>{" "}
                  <strong>You will not officially enter the game</strong> unless
                  you click the "Submit Predictions" button.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    7. 🪄 The Magic Button (Grow the Prize Pool!):
                  </span>{" "}
                  If you want the final prize to be a true fortune, bring your
                  crew! On your main dashboard, you will find an "Invite"
                  button. Use it freely to challenge your friends or family via
                  WhatsApp, SMS, or email (in Spanish or English). The more
                  players that join, the bigger the jackpot!
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    8. 📺 The VAR (Follow the live competition):
                  </span>{" "}
                  The VAR is the heart of the pool. From the main menu, you can
                  access this section to monitor in real-time how you are doing
                  against your rivals. The VAR features the following tools:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>🏆 Standings:</strong> The overall leaderboard.
                      Here you see the official ranking, your total points, and
                      the exact breakdown of where those points came from (how
                      many you earned from exact scores, goal differences, and
                      the group and champion bonuses).
                    </li>
                    <li>
                      <strong>📊 Matrix:</strong> No more secrets here! You will
                      be able to see a detailed grid with all the participants
                      and the exact scores each player predicted for every
                      match, compared with the official FIFA result.
                    </li>
                    <li>
                      <strong>📅 Date Filter:</strong> By default, the VAR will
                      only show you the matches played on the current day
                      ("Today") so you can follow the live action. However, you
                      have a dropdown menu where you can select a specific
                      calendar day or choose "All dates" to view the complete
                      tournament history.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    9. 📱 TiqueBet on your Phone (Install the App):
                  </span>{" "}
                  You don't need to search for TiqueBet in an app store to have
                  it on your phone. You can install it directly from your
                  browser in 10 seconds to play like a native app:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>On Android (Chrome):</strong> Open the pool's
                      webpage, tap the three-dot menu (top right), and select
                      "Install app" or "Add to Home screen".
                    </li>
                    <li>
                      <strong>On iPhone (Safari):</strong> Open the pool's
                      webpage, tap the share icon (the square with an upward
                      arrow at the bottom), and select "Add to Home Screen".
                    </li>
                  </ul>
                  <p className="mt-2 text-gray-400">
                    That's it! You will have the TiqueBet shield on your home
                    screen along with your other apps so you can jump in and
                    predict with a single tap.
                  </p>
                </li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-orange-400 border-b border-orange-500/30 pb-2 mb-4">
                📜 The House Rules
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">💰</span> 1. The Entry Fee (The
                    Bet)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    The entry fee to participate in the pool is{" "}
                    <strong>[FEE TO BE DEFINED]</strong>. All collected funds
                    will go into a prize pool distributed at the end of the
                    tournament as follows:{" "}
                    <strong>
                      - 80% to the winner - 15% to second place - 5% to third
                      place.
                    </strong>
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⏱️</span> 2. Locked Phases (Time
                    is money!)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    It is <strong>MANDATORY</strong> to submit your predictions
                    before the kickoff of the first match of each round. The
                    exact moment it begins, that stage{" "}
                    <strong>LOCKS AND CLOSES</strong>.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> 3. Scoring System (How
                    do you win?)
                  </h3>
                  <p className="text-gray-400 mt-2 mb-3">
                    Points per match are not cumulative (you will only receive
                    the highest single score you achieve):
                  </p>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    ⚽ Points Per Match:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 mb-4">
                    <li>
                      <strong>Exact Score:</strong> If you correctly predict the
                      exact number of goals scored by both teams, you earn{" "}
                      <strong>5 points</strong>.
                    </li>
                    <li>
                      <strong>Goal Difference or Non-Exact Tie:</strong> If you
                      predict the correct winner and exact goal difference, or a
                      tie with different scores, you earn{" "}
                      <strong>3 points</strong>.
                    </li>
                    <li>
                      <strong>Correct Winner:</strong> If you only predict who
                      won the match, you earn <strong>1 point</strong>.
                    </li>
                  </ul>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    🔥 Points for Group Qualifiers:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 mb-4">
                    <li>
                      <strong>Exact First and Second Place:</strong> If you
                      correctly predict the exact teams that qualify as 1st and
                      2nd in their correct order,{" "}
                      <strong>you earn 10 points.</strong>
                    </li>
                    <li>
                      <strong>Inverted First and Second Place:</strong> If you
                      get both qualifying teams right, but in the opposite
                      order, you earn <strong>5 points.</strong>
                    </li>
                    <li>
                      <strong>Single Qualifier:</strong> If you correctly
                      predict at least one qualifying team advancing to the next
                      round, you earn <strong>2 points.</strong>
                    </li>
                  </ul>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    👑 Points for the World Cup Champion:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>
                      <strong>Initial Champion (Group Stage):</strong> If you
                      predict the champion from your very first pick, you earn{" "}
                      <strong>15 points.</strong>
                    </li>
                    <li>
                      <strong>Second Chance Champion (Round of 32):</strong> If
                      you predict the champion before the Round of 32 starts,
                      you earn <strong>8 points.</strong> (if it's the same team
                      as your initial pick, both scores combine!).
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⚖️</span> 4. Tie-breaker Rule
                    (The early bird gets the worm!)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    If at the end of the tournament two or more players finish
                    with the exact same number of points in first place (or in
                    prize positions), the ultimate winner will be the one who
                    submitted their Group Stage predictions first. The system
                    will record the exact system date and time of your first
                    official submission before the tournament kicks off. Don't
                    leave your ticket for the last minute!
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🛑</span> 5. Knockout Stage
                    Golden Rule (Penalty shootouts don't count!)
                  </h3>
                  <p className="text-gray-400 mt-2">
                    During the knockout stages, the official score the system
                    will use for points is the result before the penalty
                    shootout (i.e., regular time plus extra time, if played). If
                    a match ends 1-1 and goes to penalties, the official score
                    for the game is 1-1.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="mt-12">
        <AppFooter lang={lang} />
      </div>
    </main>
  );
}
