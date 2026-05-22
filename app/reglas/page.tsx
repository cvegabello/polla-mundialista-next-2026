// app/reglas/page.tsx
"use client"; // 👈 SE VOLVIÓ CLIENT COMPONENT PARA PODER COPIAR AL PORTAPAPELES

import React, { useState, useEffect } from "react";
import { Language } from "@/components/constants/dictionary";
import { AppFooter } from "@/components/shared/AppFooter";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react"; // 👈 NUEVOS ÍCONOS

export default function ReglasPage() {
  const [lang, setLang] = useState<Language>("es");
  const [hasSession, setHasSession] = useState(false);
  const [copied, setCopied] = useState(false); // 👈 ESTADO PARA EL EFECTO DE COPIADO

  // Leer parámetros de la URL y Cookies en el cliente de forma segura
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");

      // 1. Revisar si viene idioma por URL
      if (urlLang === "en" || urlLang === "es") {
        setLang(urlLang as Language);
      } else {
        // 2. Si no hay URL, buscar la cookie de sesión
        const cookies = document.cookie.split("; ");
        const sessionCookie = cookies.find((row) =>
          row.startsWith("polla_session="),
        );

        if (sessionCookie) {
          setHasSession(true);
          try {
            const rawValue = sessionCookie.split("=")[1];
            const userSession = JSON.parse(decodeURIComponent(rawValue));
            if (userSession.lang === "en" || userSession.lang === "es") {
              setLang(userSession.lang as Language);
            }
          } catch (e) {
            console.error("Error parsing session cookie for rules page");
          }
        }
      }
    }
  }, []);

  // 🪄 FUNCIÓN MÁGICA PARA COPIAR EL LINK CON EL IDIOMA CORRECTO
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin + window.location.pathname;
      // Si la página actual está en inglés, le clava de una vez el ?lang=en
      const linkToCopy = lang === "en" ? `${baseUrl}?lang=en` : baseUrl;

      navigator.clipboard.writeText(linkToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Vuelve a la normalidad en 2 segundos
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0b10] text-gray-200 py-6 px-4 md:py-10 md:px-10 lg:px-20 relative">
      {/* SECCIÓN DE BOTONES SUPERIORES */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-4 items-center justify-between">
        {/* BOTÓN VOLVER (SOLO SI HAY SESIÓN) */}
        {hasSession ? (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-all duration-300 bg-[#0f1016] px-5 py-2.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 text-sm"
          >
            <ArrowLeft size={18} />
            {lang === "es" ? "Volver al Dashboard" : "Back to Dashboard"}
          </Link>
        ) : (
          <div /> // Espaciador si no hay sesión
        )}

        {/* 🆕 BOTÓN DE COPIAR LINK INTELIGENTE */}
        <button
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-2 font-bold transition-all duration-300 px-5 py-2.5 rounded-full border text-sm cursor-pointer active:scale-95 ${
            copied
              ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-[#0f1016] text-amber-400 hover:text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          }`}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied
            ? lang === "es"
              ? "¡Link Copiado!"
              : "Link Copied!"
            : lang === "es"
              ? "Copiar Link de Reglas"
              : "Copy Rules Link"}
        </button>
      </div>

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
                    1. 🔐 Cómo crear tu cuenta (El Primer Ingreso):
                  </span>{" "}
                  Cuando recibes el link de invitación, ese link ya te conecta
                  directamente a la polla correcta.{" "}
                  <strong>Nadie te va a enviar un usuario</strong> — ¡tú mismo
                  te lo inventas! Al ingresar por primera vez solo necesitas:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>Elegir tu nombre de usuario</strong> (el apodo
                      con el que te verán tus rivales). Puede ser cualquier
                      cosa: tu nombre, apodo, alias...
                    </li>
                    <li>
                      <strong>Asignarte un PIN de 4 dígitos</strong> (tu
                      contraseña para volver a entrar en el futuro).
                    </li>
                  </ul>
                  <p className="mt-2 text-gray-400">
                    ⚠️ <strong>Ojo con estos casos:</strong>
                  </p>
                  <ul className="list-disc pl-6 mt-1 space-y-1 text-gray-400">
                    <li>
                      Si participas en{" "}
                      <strong>dos o más pollas diferentes</strong>, debes usar
                      un{" "}
                      <strong>nombre de usuario distinto en cada una</strong>.
                    </li>
                    <li>
                      Si el sistema te muestra{" "}
                      <em>
                        &quot;Contraseña incorrecta o el nombre de usuario ya
                        está en uso&quot;
                      </em>
                      , puede ser una de estas dos situaciones:
                      <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>
                          <strong>Te equivocaste el PIN:</strong> Intenta de
                          nuevo con el PIN correcto.
                        </li>
                        <li>
                          <strong>
                            Ese nombre de usuario ya lo usa otra persona:
                          </strong>{" "}
                          Simplemente elige un nombre diferente e intenta de
                          nuevo.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    2. Simulación vs. Juego Real:
                  </span>{" "}
                  Puedes jugar y simular los results de todo el torneo hasta la
                  gran final para ver cómo quedarían tus cruces, pero{" "}
                  <strong>
                    en la primera etapa solo se jugarán y enviarán oficialmente
                    tus pronósticos de la Fase de Grupos
                  </strong>
                  .
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    3. Desbloqueo de Fases:
                  </span>{" "}
                  El torneo se juega por etapas. Las fases de eliminación
                  directe se irán desbloqueando unos días antes de su inicio,
                  únicamente cuando se conozcan los cruces oficiales.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    4. Actualización del Cuadro (¡Ojo al VAR!):
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
                    5. Condición para Enviar:
                  </span>{" "}
                  Para que tus predicciones sean válidas, es obligatorio
                  ingresar los marcadores de <strong>TODOS</strong> los partidos
                  de esa ronda. Solo así se habilitará el botón de "Enviar
                  Pronósticos".
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    6. 🏆 Elige a tu Campeón:
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
                    7. 🎟️ Pronosticar no es participar:
                  </span>{" "}
                  <strong>No entrarás a jugar oficialmente</strong> si no haces
                  clic en el botón de "Enviar Pronósticos".
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    8. 🪄 El Botón Mágico (¡Haz crecer el pozo!):
                  </span>{" "}
                  Si quieres que el premio final sea una verdadera fortuna,
                  ¡trae a tu gente! En tu panel principal encontrarás un botón
                  de "Invitar". Úsalo libremente para retar a tus amigos o
                  familiares por WhatsApp, SMS o correo (en español o inglés).
                  ¡Entre más jugadores entren, más grande será el botín!
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    9. 📺 El VAR (Sigue la competencia en vivo):
                  </span>{" "}
                  El VAR es el corazón de la polla. Desde el menú principal
                  puedes acceder a esta sección para monitorear en tiempo real
                  cómo vas frente a tus rivales. El VAR cuenta con las
                  siguientes herramientas:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>🏆 Standings (Posiciones):</strong> La tabla
                      general. Aquí ves el ranking oficial, tus puntos totales y
                      el desglose exacto de dónde salieron esos puntos.
                    </li>
                    <li>
                      <strong>📊 Matrix (La Matriz):</strong> ¡Aquí se acaban
                      los secretos! Podrás ver una cuadrícula detallada con
                      todos los participantes y los marcadores exactos que cada
                      jugador pronosticó para cada partido.
                    </li>
                    <li>
                      <strong>📅 Filtro de Fechas:</strong> Por defecto, el VAR
                      te mostrará únicamente los partidos que se juegan en el
                      día actual ("Hoy"). Sin embargo, cuentas con un menú
                      desplegable donde puedes seleccionar un día específico o
                      elegir "Todas las fechas".
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    10. 📱 TiqueBet en tu Celular (Instala la App):
                  </span>{" "}
                  No necesitas buscar TiqueBet in una tienda de aplicaciones
                  para tenerla en tu teléfono. Puedes instalarla directamente
                  desde tu navegador:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>En Android (Chrome):</strong> Abre la página, toca
                      el menú de los tres puntitos y selecciona "Instalar
                      aplicación" o "Agregar a la pantalla principal".
                    </li>
                    <li>
                      <strong>En iPhone (Safari):</strong> Abre la página, toca
                      el ícono de compartir y selecciona "Agregar a Inicio".
                    </li>
                  </ul>
                  <p className="mt-2 text-gray-400">
                    ¡Listo! Tendrás el escudo de TiqueBet en tu pantalla junto a
                    tus otras aplicaciones para entrar con un solo toque.
                  </p>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    11. 🌐 ¿Prefieres ver TiqueBet en Inglés?
                  </span>{" "}
                  La app está disponible en <strong>español e inglés</strong>.
                  Puedes cambiar el idioma desde la pantalla de inicio de
                  sesión usando el selector con el ícono de globo{" "}
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                    🌐
                  </span>{" "}
                  ubicado en el formulario de acceso. La app también detecta
                  automáticamente el idioma de tu dispositivo la primera vez
                  que ingresas.
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
                    repartirá al finalizar el torneo. De la siguiente manera: -{" "}
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
                      un empate con otros goles, ganas <strong>3 puntos</strong>
                      .
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
                      equipos clasifican como 1° y 2° en su orden correcto,{" "}
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
                    lugar, el ganador definitivo será el que haya enviado sus
                    pronósticos de la Fase de Grupos primero. El sistema
                    registrará la fecha y hora exacta de tu primer envío
                    oficial.
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
                    a penales, el resultado oficial es 1-1.
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
                    1. 🔐 How to Create Your Account (First Time Login):
                  </span>{" "}
                  When you receive the invitation link, it already connects you
                  directly to the right pool.{" "}
                  <strong>Nobody will send you a username</strong> — you create
                  it yourself! The first time you log in, all you need is:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>Choose a username</strong> (the nickname your
                      rivals will see). It can be anything: your name, a
                      nickname, an alias...
                    </li>
                    <li>
                      <strong>Set a 4-digit PIN</strong> (your password for
                      future logins).
                    </li>
                  </ul>
                  <p className="mt-2 text-gray-400">
                    ⚠️ <strong>Watch out for these cases:</strong>
                  </p>
                  <ul className="list-disc pl-6 mt-1 space-y-1 text-gray-400">
                    <li>
                      If you are joining{" "}
                      <strong>two or more different pools</strong>, you must use
                      a{" "}
                      <strong>different username in each one</strong>.
                    </li>
                    <li>
                      If the system shows{" "}
                      <em>
                        &quot;Incorrect password or username already taken&quot;
                      </em>
                      , it could be one of two things:
                      <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>
                          <strong>You entered the wrong PIN:</strong> Try again
                          with the correct PIN.
                        </li>
                        <li>
                          <strong>
                            That username is already taken by someone else:
                          </strong>{" "}
                          Simply choose a different username and try again.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    2. Simulation vs. Real Game:
                  </span>{" "}
                  You can play and simulate the results of the entire
                  tournament, but{" "}
                  <strong>
                    initially, only your Group Stage predictions will be
                    officially submitted and played
                  </strong>
                  .
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    3. Unlocking Phases:
                  </span>{" "}
                  The knockout phases will unlock a few days before they start,
                  only after the official real-life matchups are confirmed.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    4. Bracket Updates (VAR Check!):
                  </span>{" "}
                  Once the real qualified teams are confirmed,{" "}
                  <strong>
                    any previous simulations you made in the bracket will be
                    wiped clean
                  </strong>
                  . You must enter your final predictions based on those real
                  matchups.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    5. Submission Rule:
                  </span>{" "}
                  To make your predictions valid, it is mandatory to enter the
                  scores for <strong>ALL</strong> matches in that round.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    6. 🏆 Pick Your Champion:
                  </span>{" "}
                  The game will ask you to predict who will lift the trophy at{" "}
                  <strong>two key moments</strong>:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <em>The First Pick:</em> Upon submitting your Group Stage
                      predictions.
                    </li>
                    <li>
                      <em>The Second Chance:</em> Before the Round of 32
                      matchups begin.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    7. 🎟️ Predicting isn't participating:
                  </span>{" "}
                  <strong>You will not officially enter the game</strong> unless
                  you click the "Submit Predictions" button.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    8. 🪄 The Magic Button:
                  </span>{" "}
                  If you want the final prize to be a true fortune, bring your
                  crew! Use the "Invite" button freely to challenge your friends
                  via WhatsApp.
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    9. 📺 The VAR (Follow the live competition):
                  </span>{" "}
                  The VAR is the heart of the pool. The VAR features the
                  following tools:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>🏆 Standings:</strong> The overall leaderboard.
                      Here you see the official ranking and your total points.
                    </li>
                    <li>
                      <strong>📊 Matrix:</strong> See a detailed grid with all
                      participants and the exact scores each player predicted.
                    </li>
                    <li>
                      <strong>📅 Date Filter:</strong> By default, the VAR will
                      only show matches played "Today". However, you can select
                      a specific calendar day or choose "All dates".
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    10. 📱 TiqueBet on your Phone (Install the App):
                  </span>{" "}
                  You don't need an app store to have it on your phone. You can
                  install it directly from your browser:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                    <li>
                      <strong>On Android (Chrome):</strong> Open the webpage,
                      tap the three-dot menu, and select "Install app" or "Add
                      to Home screen".
                    </li>
                    <li>
                      <strong>On iPhone (Safari):</strong> Open the webpage, tap
                      the share icon, and select "Add to Home Screen".
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="text-amber-500 font-bold">
                    11. 🌐 Prefer TiqueBet in Spanish?
                  </span>{" "}
                  The app is fully available in both <strong>English and Spanish</strong>.
                  You can switch the language from the login screen using the
                  globe icon{" "}
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                    🌐
                  </span>{" "}
                  selector on the login form. The app also automatically detects
                  your device&apos;s language the first time you log in.
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
                    The entry fee is <strong>[FEE TO BE DEFINED]</strong>. All
                    collected funds will go into a prize pool distributed as
                    follows:{" "}
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
                    Points per match are not cumulative:
                  </p>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    ⚽ Points Per Match:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 mb-4">
                    <li>
                      <strong>Exact Score:</strong> If you correctly predict the
                      exact number of goals, you earn <strong>5 points</strong>.
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
                      <strong>Exact First and Second Place:</strong> Exact teams
                      in their correct order,{" "}
                      <strong>you earn 10 points.</strong>
                    </li>
                    <li>
                      <strong>Inverted First and Second Place:</strong> Both
                      qualifying teams right, opposite order, you earn{" "}
                      <strong>5 points.</strong>
                    </li>
                    <li>
                      <strong>Single Qualifier:</strong> At least one qualifying
                      team, you earn <strong>2 points.</strong>
                    </li>
                  </ul>

                  <h4 className="text-cyan-400 font-bold mb-1">
                    👑 Points for the World Cup Champion:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>
                      <strong>Initial Champion:</strong> If you predict the
                      champion from your first pick, you earn{" "}
                      <strong>15 points.</strong>
                    </li>
                    <li>
                      <strong>Second Chance Champion:</strong> If you predict
                      the champion before the Round of 32 starts, you earn{" "}
                      <strong>8 points.</strong>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⚖️</span> 4. Tie-breaker Rule
                  </h3>
                  <p className="text-gray-400 mt-2">
                    If players finish with the exact same points, the ultimate
                    winner will be the one who submitted their Group Stage
                    predictions first (System Date and Time).
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🛑</span> 5. Knockout Stage
                    Golden Rule
                  </h3>
                  <p className="text-gray-400 mt-2">
                    During the knockout stages, the official score the system
                    will use for points is the result before the penalty
                    shootout (i.e., regular time plus extra time).
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
