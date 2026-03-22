"use client";

import React, { useState } from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { Rocket, CheckCircle, Lock, AlertTriangle } from "lucide-react";
import { SubmitGroupModal } from "@/components/predictions/SubmitGroupModal"; // 👈 Asumiendo que guardó el modal en la misma carpeta
import { getAllTeamsAction } from "@/lib/actions/fan-actions";

interface SubmitZoneProps {
  lang: Language;
  isSubmitted: boolean;
  isComplete: boolean;
  progress: number;
  total: number;
  hasUnsavedChanges: boolean;
  // 👇 ATENCIÓN: Ahora onSubmit espera recibir el número (ID) del campeón
  onSubmit: (championId: any) => void;
  isSubmitAllowed?: boolean;
}

export const SubmitZone = ({
  lang,
  isSubmitted,
  isComplete,
  progress,
  total,
  hasUnsavedChanges,
  onSubmit,
  isSubmitAllowed = true,
}: SubmitZoneProps) => {
  const t = DICTIONARY[lang];

  // 🚀 ESTADOS PARA EL MODAL DEL CAMPEÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estilos del Botón
  const btnDisabled =
    "bg-[#1a1b26] border border-gray-700 text-gray-500 cursor-not-allowed shadow-none opacity-60";

  const btnActive =
    "bg-linear-to-r from-emerald-400 to-green-500 text-[#0a2f15] border border-green-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] cursor-pointer animate-pulse-slow";

  const btnWarning =
    "bg-amber-500/20 border border-amber-500/50 text-amber-400 cursor-not-allowed shadow-none opacity-90";

  const btnSubmitted =
    "bg-green-900/20 border border-green-500/50 text-green-400 cursor-default";

  // 🚀 FUNCIÓN QUE ABRE EL MODAL Y TRAE LOS EQUIPOS
  const handleOpenModal = async () => {
    setIsModalOpen(true);
    if (teams.length === 0) {
      setIsLoadingTeams(true);
      const data = await getAllTeamsAction();
      setTeams(data || []);
      setIsLoadingTeams(false);
    }
  };

  // 🚀 FUNCIÓN QUE SE EJECUTA CUANDO EL FAN ELIGE AL CAMPEÓN Y DA ACEPTAR
  const handleConfirm = async (championId: any) => {
    setIsSubmitting(true);
    await onSubmit(championId);
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto mb-6 relative z-20">
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0f1016] border border-gray-700 shadow-2xl relative overflow-hidden transition-all duration-300">
          {isComplete &&
            !isSubmitted &&
            !hasUnsavedChanges &&
            isSubmitAllowed && (
              <div className="absolute inset-0 bg-green-500/5 blur-3xl pointer-events-none" />
            )}

          {isSubmitted ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-base tracking-widest uppercase w-full justify-center ${btnSubmitted}`}
              >
                <CheckCircle size={20} />
                {t.submittedLabel}
              </div>
              <span className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                <Lock size={12} />{" "}
                {lang === "en"
                  ? "Your predictions are secured"
                  : "Tus pronósticos están blindados"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* 👇 LA MAGIA DE LOS 4 ESTADOS DEL BOTÓN */}
              <button
                // 🚀 AQUÍ EL CAMBIO CLAVE: Ya no llama a onSubmit directo, llama a handleOpenModal
                onClick={handleOpenModal}
                disabled={
                  !isComplete || hasUnsavedChanges || isSubmitAllowed === false
                }
                className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-base md:text-lg tracking-[0.2em] uppercase transition-all duration-300 w-full shadow-lg group ${
                  isComplete && !hasUnsavedChanges && isSubmitAllowed
                    ? btnActive
                    : isComplete && hasUnsavedChanges && isSubmitAllowed
                      ? btnWarning
                      : btnDisabled
                }`}
              >
                {!isSubmitAllowed ? (
                  <>
                    <Lock size={20} className="text-gray-500" />
                    {lang === "en" ? "SUBMISSIONS CLOSED" : "ENVÍOS CERRADOS"}
                  </>
                ) : isComplete && hasUnsavedChanges ? (
                  <>
                    <AlertTriangle size={20} className="text-amber-400" />
                    {lang === "en" ? "SAVE TO SUBMIT" : "GUARDE PARA ENVIAR"}
                  </>
                ) : (
                  <>
                    <Rocket
                      size={20}
                      className={`transition-transform duration-500 ${isComplete && !hasUnsavedChanges ? "group-hover:-translate-y-1 group-hover:translate-x-1" : ""}`}
                    />
                    {t.submitButton}
                  </>
                )}
              </button>

              {/* 👇 MENSAJES DE ESTADO INFERIORES */}
              {!isSubmitAllowed ? (
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-center mt-1">
                  {lang === "en"
                    ? "The administrator has not opened this phase yet."
                    : "El administrador aún no ha habilitado esta fase."}
                </p>
              ) : !isComplete ? (
                <div className="text-center flex flex-col items-center gap-1">
                  <p className="text-white text-base font-medium drop-shadow-md">
                    {t.submitWarning}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                    {lang === "en" ? "Progress:" : "Progreso:"}
                    <span
                      className={`ml-2 text-2xl font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] text-yellow-400`}
                    >
                      {progress}/{total}
                    </span>
                  </p>
                </div>
              ) : hasUnsavedChanges ? (
                <p className="text-amber-400 text-sm font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">
                  {lang === "en"
                    ? "⚠️ YOU HAVE UNSAVED CHANGES"
                    : "⚠️ TIENE CAMBIOS SIN GUARDAR"}
                </p>
              ) : (
                <p className="text-green-400 text-sm font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
                  {t.readyMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 AQUÍ METEMOS EL MODAL QUE LE DI EN EL MENSAJE PASADO */}
      <SubmitGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        teams={teams}
        lang={lang}
        isLoading={isLoadingTeams || isSubmitting}
      />
    </>
  );
};
