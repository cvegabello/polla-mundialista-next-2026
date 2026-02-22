"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Save,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Language } from "@/components/constants/dictionary";

interface SystemAlertsProps {
  // 👇 Añadimos los dos nuevos estados a la interfaz
  modalType:
    | "none"
    | "refresh"
    | "logout"
    | "success"
    | "autosaving"
    | "autosaved";
  closeModal: () => void;
  confirmRefresh: () => void;
  proceedWithLogout: (saveFirst: boolean) => void;
  lang: Language;
}

export const SystemAlerts = ({
  modalType,
  closeModal,
  confirmRefresh,
  proceedWithLogout,
  lang,
}: SystemAlertsProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || modalType === "none") return null;

  // 🔵 TOAST DE "GUARDANDO..." (Auto-save en progreso)
  if (modalType === "autosaving") {
    const toastContent = (
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[99999] animate-in slide-in-from-top-10 fade-in duration-300">
        <div className="flex items-center gap-3 bg-slate-900/95 border border-cyan-500/50 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md">
          <Loader2 className="text-cyan-400 animate-spin" size={24} />
          <span className="text-white font-bold tracking-wide">
            {lang === "en" ? "Auto-saving..." : "Guardando automáticamente..."}
          </span>
        </div>
      </div>
    );
    return createPortal(toastContent, document.body);
  }

  // 🟢 TOAST DE ÉXITO (Manual o Automático)
  if (modalType === "success" || modalType === "autosaved") {
    const isAuto = modalType === "autosaved";
    const text = isAuto
      ? lang === "en"
        ? "Auto-saved successfully!"
        : "¡Guardado automático exitoso!"
      : lang === "en"
        ? "Predictions saved successfully!"
        : "¡Pronósticos guardados exitosamente!";

    const toastContent = (
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[99999] animate-in slide-in-from-top-10 fade-in duration-500">
        <div className="flex items-center gap-3 bg-slate-900/95 border border-emerald-500/50 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md">
          <CheckCircle2 className="text-emerald-400" size={24} />
          <span className="text-white font-bold tracking-wide">{text}</span>
        </div>
      </div>
    );
    return createPortal(toastContent, document.body);
  }

  // 🔴 TEXTOS SEGÚN IDIOMA PARA MODALES (Logout / Refresh)
  const isLogout = modalType === "logout";
  const title = isLogout
    ? lang === "en"
      ? "Wait! Unsaved Changes"
      : "¡Espera! Cambios sin guardar"
    : lang === "en"
      ? "Refresh Warning"
      : "Advertencia al Refrescar";

  const message = isLogout
    ? lang === "en"
      ? "You have unsaved predictions. Do you want to save them before logging out?"
      : "Tienes pronósticos sin guardar. ¿Deseas guardarlos antes de salir de tu cuenta?"
    : lang === "en"
      ? "If you refresh the page now, you will lose your recent unsaved predictions. Are you sure?"
      : "Si refrescas la página ahora, perderás tus pronósticos recientes que no has guardado. ¿Estás seguro?";

  // 🟡 MODAL CENTRAL (Para Refresh y Logout)
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 md:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* ICONO ANIMADO */}
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-amber-500/30">
          <AlertTriangle className="text-amber-500" size={40} />
        </div>

        <h2 className="text-2xl font-black text-white mb-3">{title}</h2>
        <p className="text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
          {message}
        </p>

        {/* BOTONES */}
        <div className="flex flex-col w-full gap-3">
          {isLogout ? (
            <>
              <button
                onClick={() => proceedWithLogout(true)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Save size={18} />
                {lang === "en" ? "Save and Logout" : "Guardar y Salir"}
              </button>
              <button
                onClick={() => proceedWithLogout(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-red-400 bg-slate-800 hover:bg-slate-700 hover:text-red-300 transition-colors border border-red-500/30"
              >
                <LogOut size={18} />
                {lang === "en" ? "Logout without saving" : "Salir sin guardar"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={confirmRefresh}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-slate-900 bg-cyan-500 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw size={18} />
                {lang === "en"
                  ? "Yes, refresh and lose changes"
                  : "Sí, refrescar y perder cambios"}
              </button>
            </>
          )}

          <button
            onClick={closeModal}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors mt-2"
          >
            <X size={18} />
            {lang === "en" ? "Cancel" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
