"use client";

import React from "react";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { GroupCard } from "@/components/groups/GroupCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

// 👇 Importaciones para el Logout interno
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// Componentes propios
import { FanHeader } from "@/components/fan/header/FanHeader";
import { FloatingProgress } from "@/components/fan/FloatingProgress";

// 👇 IMPORTAMOS EL HOOK
import { useFanDashboardLogic } from "@/hooks/useFanDashboardLogic";

interface FanDashboardProps {
  userSession: any;
  groupsData: any[];
  userPredictions: any[];
  loadingData: boolean;
  lang: Language;
  onLogout?: () => void; // Lo dejamos opcional para que el Server Component no chille
}

export const FanDashboard = ({
  userSession,
  groupsData,
  userPredictions,
  loadingData,
  lang,
}: FanDashboardProps) => {
  const t = DICTIONARY[lang];
  const router = useRouter();

  // 👇 Inicializamos Supabase para el cliente
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // 👇 1. TRAEMOS TODO DEL HOOK
  const {
    currentView,
    setCurrentView,
    progress,
    totalMatches,
    showFloating,
    handleSubmit,
    hasSubmitted,
    handlePredictionChange,
  } = useFanDashboardLogic(userPredictions, userSession?.id);

  // 👇 2. LÓGICA DE BLOQUEO🔒
  const isLocked = !!userSession?.submission_date || hasSubmitted;

  // 👇 3. TRUCO VISUAL PARA EL HEADER
  const headerSession = isLocked
    ? {
        ...userSession,
        submission_date:
          userSession?.submission_date || new Date().toISOString(),
      }
    : userSession;

  const handleInternalLogout = () => {
    // 1. Borramos la cookie manual (le ponemos fecha de ayer para que expire)
    document.cookie =
      "polla_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";

    // 2. Limpiamos el localStorage por si las moscas
    localStorage.removeItem("polla_session");

    // 3. Mandamos pal login con recarga total
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen transition-colors duration-300 bg-transparent dark:bg-transparent relative pb-20">
      <StarBackground />
      <CloudsBackground />

      {/* HEADER */}
      <FanHeader
        userSession={headerSession}
        lang={lang}
        onLogout={handleInternalLogout} // 👈 CAMBIO AQUÍ: Ahora usa la función interna
        currentView={currentView}
        onViewChange={setCurrentView}
        totalPredictions={progress}
        totalMatches={totalMatches}
        onSubmitPredictions={handleSubmit}
      />

      {/* CONTENIDO PRINCIPAL */}
      {loadingData ? (
        <div className="text-center text-white z-10 relative animate-pulse mt-12">
          {t.loadingGroups}
        </div>
      ) : (
        <div className="relative z-10">
          {currentView === "pred_groups" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center px-4">
              {groupsData?.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  lang={lang}
                  initialPredictions={userPredictions}
                  onPredictionChange={handlePredictionChange}
                  isLocked={isLocked}
                />
              ))}
            </div>
          )}

          {currentView !== "pred_groups" && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-white/50 bg-slate-900/40 backdrop-blur-md mx-auto max-w-2xl rounded-xl border border-white/10 p-8">
              <p className="text-xl mb-2">🚧 {t.worldCupTitle} 🚧</p>
              <p>Esta sección está en construcción.</p>
              <p className="text-sm mt-4 text-cyan-400">
                Vista seleccionada: {currentView}
              </p>
            </div>
          )}
        </div>
      )}

      {currentView === "pred_groups" && !isLocked && (
        <FloatingProgress
          current={progress}
          total={totalMatches}
          isVisible={showFloating}
          lang={lang}
        />
      )}
    </main>
  );
};
