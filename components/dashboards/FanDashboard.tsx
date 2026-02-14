"use client";

import React from "react";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { GroupCard } from "@/components/groups/GroupCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

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
  onLogout: () => void;
}

export const FanDashboard = ({
  userSession,
  groupsData,
  userPredictions,
  loadingData,
  lang,
  onLogout,
}: FanDashboardProps) => {
  const t = DICTIONARY[lang];

  // 👇 1. TRAEMOS TODO DEL HOOK
  const {
    currentView,
    setCurrentView,
    progress,
    totalMatches,
    // isComplete, (no lo usamos directo aquí, pero el hook lo maneja)
    showFloating,
    handleSubmit, // 👈 La función real de enviar
    hasSubmitted, // 👈 Estado local de "Acabo de enviar"
    handlePredictionChange,
  } = useFanDashboardLogic(userPredictions, userSession?.id);

  // 👇 2. LÓGICA DE BLOQUEO (CRÍTICO) 🔒
  // Está bloqueado si: Ya venía enviado de DB (userSession) O Acabamos de enviar (hasSubmitted)
  const isLocked = !!userSession?.submission_date || hasSubmitted;

  // 👇 3. TRUCO VISUAL PARA EL HEADER
  // Si acabamos de enviar (hasSubmitted), engañamos al header para que muestre
  // el estado "Enviado" sin tener que recargar la página.
  const headerSession = isLocked
    ? {
        ...userSession,
        submission_date:
          userSession?.submission_date || new Date().toISOString(),
      }
    : userSession;

  return (
    <main className="min-h-screen transition-colors duration-300 bg-transparent dark:bg-transparent relative pb-20">
      <StarBackground />
      <CloudsBackground />

      {/* HEADER */}
      <FanHeader
        userSession={headerSession} // 👈 Pasamos la sesión "trucada" si ya envió
        lang={lang}
        onLogout={onLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
        // 👇 Datos VIVOS
        totalPredictions={progress}
        totalMatches={totalMatches}
        onSubmitPredictions={handleSubmit} // 👈 Pasamos la función REAL del Hook
      />

      {/* CONTENIDO PRINCIPAL */}
      {loadingData ? (
        <div className="text-center text-white z-10 relative animate-pulse mt-12">
          {t.loadingGroups}
        </div>
      ) : (
        <div className="relative z-10">
          {/* VISTA: FASE DE GRUPOS */}
          {currentView === "pred_groups" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center px-4">
              {groupsData?.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  lang={lang}
                  initialPredictions={userPredictions}
                  onPredictionChange={handlePredictionChange}
                  // 👇 4. PASAMOS EL BLOQUEO A LAS TARJETAS
                  isLocked={isLocked}
                />
              ))}
            </div>
          )}

          {/* VISTA: OTRAS (Placeholder) */}
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

      {/* 👇 PASTILLA FLOTANTE */}
      {/* Solo sale si: Estamos en grupos Y NO está bloqueado (ya enviado) */}
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
