"use client";

import React, { useState, useEffect } from "react";
import { UserManagementModal } from "./UserManagementModal";
import {
  resetOfficialDataAction,
  forceRecalculateAllBracketsAction,
} from "@/lib/actions/super-admin-actions";
import { Settings, Users, AlertOctagon, Lock } from "lucide-react";
import {
  getAdminPanelDataAction,
  togglePhaseAction,
} from "@/lib/actions/admin-config-actions";

export const SystemConfigPanel = () => {
  const [panelData, setPanelData] = useState<{
    config: any;
    stats: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para recargar la data
  const loadData = async () => {
    setLoading(true);
    const data = await getAdminPanelDataAction();
    if (data) setPanelData(data);
    setLoading(false);
  };

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    // 🛡️ Doble confirmación porque esto es destructivo
    const confirm1 = window.confirm(
      "☢️ ¡ALERTA ROJA! ¿Está seguro que desea borrar TODOS los resultados oficiales?",
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      "¿Seguro? Esto dejará el torneo en ceros (no borrará pronósticos de usuarios). Esta acción es irreversible.",
    );
    if (!confirm2) return;

    setIsResetting(true);
    try {
      const res = await resetOfficialDataAction();
      if (res.success) {
        alert("✅ Torneo reseteado con éxito. Todo está en ceros.");
        window.location.reload(); // Recargamos para limpiar toda la memoria
      } else {
        alert("❌ Hubo un error al resetear los datos.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleTogglePhase = async (column: string, currentValue: boolean) => {
    const newValue = !currentValue;

    if (newValue && column !== "allow_groups") {
      const isConfirmed = window.confirm(
        "¡ATENCIÓN! Al abrir esta fase, se inyectarán las llaves oficiales y se borrarán los pronósticos de los fans de esta fase en adelante (El pasado no se toca). ¿Está seguro?",
      );
      if (!isConfirmed) return;
    }

    // Actualizamos la UI inmediatamente (Optimistic UI)
    setPanelData((prev: any) => ({
      ...prev,
      config: { ...prev.config, [column]: newValue },
    }));

    const shouldClearPredictions = newValue && column !== "allow_groups";
    await togglePhaseAction(column, newValue, shouldClearPredictions);
  };

  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculateBrackets = async () => {
    const confirm = window.confirm(
      "🧙‍♂️ ¿Desea forzar el cálculo de las llaves de TODOS los usuarios basado en sus pronósticos actuales? (Ideal para migrar datos viejos)",
    );
    if (!confirm) return;

    setIsRecalculating(true);
    try {
      const res = await forceRecalculateAllBracketsAction();
      if (res.success) {
        alert(
          `✅ ¡Magia completada! Se actualizaron las llaves de ${res.count} usuarios.`,
        );
      } else {
        alert("❌ Hubo un error al recalcular las llaves.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (loading && !panelData) {
    return (
      <div className="text-orange-400 animate-pulse text-center p-8 font-bold tracking-widest">
        CARGANDO SISTEMA...
      </div>
    );
  }

  const { config, stats } = panelData!;

  // 🧠 LÓGICA DE CANDADOS Y CONTADORES VISUALES ELEGANTES
  const phases = [
    {
      label: "Grupos",
      col: "allow_groups",
      disabled: false,
      count: stats.groups,
      total: 72,
    },
    {
      label: "16avos",
      col: "allow_r32",
      disabled: stats.groups < 72,
      count: stats.r32,
      total: 16,
    },
    {
      label: "8vos",
      col: "allow_r16",
      disabled: stats.r32 < 16,
      count: stats.r16,
      total: 8,
    },
    {
      label: "Cuartos",
      col: "allow_qf",
      disabled: stats.r16 < 8,
      count: stats.qf,
      total: 4,
    },
    {
      label: "Semis",
      col: "allow_sf",
      disabled: stats.qf < 4,
      count: stats.sf,
      total: 2,
    },
    {
      label: "Final",
      col: "allow_f",
      disabled: stats.sf < 2,
      count: stats.f,
      total: 2,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-[2px] rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] mt-8">
      <div className="bg-[#0f1016] rounded-2xl p-6 md:p-10 w-full h-full border border-slate-800/80">
        <div className="flex items-center justify-center gap-3 mb-8 pb-6 border-b border-white/5 relative">
          <Settings className="text-orange-500" size={32} />
          <h2 className="text-2xl md:text-3xl font-black text-orange-500 tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(249,115,22,0.4)]">
            Configuración & Reglas
          </h2>
          <button
            onClick={loadData}
            className="absolute right-0 text-xs bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>🔄</span> Refrescar Data
          </button>
        </div>

        {/* FASES CON CANDADO Y CONTADORES */}
        <div className="mb-12">
          <p className="text-slate-400 font-bold text-sm mb-6 tracking-widest uppercase text-center flex flex-col items-center gap-1">
            <span>Habilitar Fases (Check para abrir)</span>
            <span className="text-xs text-orange-400/80 normal-case font-normal max-w-md">
              Las fases finales se desbloquearán cuando se ingresen todos los
              marcadores oficiales de la fase anterior.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-6 bg-black/30 p-8 rounded-2xl border border-white/5 shadow-inner">
            {phases.map((phase) => {
              const isComplete = phase.count === phase.total;

              return (
                <label
                  key={phase.col}
                  className={`flex items-center justify-start gap-5 px-6 py-6 min-w-[190px] rounded-2xl border-2 transition-all duration-300 relative ${
                    phase.disabled
                      ? "bg-[#13141c] border-slate-800 text-slate-600 cursor-not-allowed opacity-60"
                      : config?.[phase.col]
                        ? "bg-orange-950/40 border-orange-500/60 text-orange-200 shadow-[0_5px_15px_rgba(249,115,22,0.2)] cursor-pointer hover:-translate-y-1"
                        : "bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 cursor-pointer hover:-translate-y-1"
                  }`}
                >
                  {/* Icono o Checkbox (Con un contenedor de tamaño fijo) */}
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                    {phase.disabled ? (
                      <Lock size={22} className="text-slate-600" />
                    ) : (
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-orange-500 cursor-pointer rounded bg-slate-800 border-slate-600"
                        checked={config?.[phase.col] || false}
                        onChange={() =>
                          handleTogglePhase(phase.col, config?.[phase.col])
                        }
                      />
                    )}
                  </div>

                  {/* Textos y Pastillita (Badge) con más respiro */}
                  <div className="flex flex-col items-start gap-2 w-full">
                    <span className="font-black text-sm md:text-base uppercase tracking-wider">
                      {phase.label}
                    </span>

                    {/* El contador elegante más redondito y espacioso */}
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold tracking-widest inline-block ${
                        isComplete
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : phase.disabled
                            ? "bg-slate-800 text-slate-500 border border-slate-700"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {phase.count} / {phase.total}
                    </span>
                  </div>

                  {/* Tooltip interactivo */}
                  {phase.disabled && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-slate-700 text-xs text-slate-300 px-4 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                      Requiere completar fase anterior
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* RESTO DE SECCIONES */}
        {/* 🛠️ HERRAMIENTAS DE ADMINISTRACIÓN */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8 mb-14 border-b border-white/5 pb-12">
          {/* Botón: Gestionar Usuarios */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="cursor-pointer group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.1em] py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 border border-blue-400/30"
          >
            <Users size={24} className="group-hover:animate-bounce" />
            <span>Gestionar Usuarios</span>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </button>

          {/* 🧙‍♂️ Botón Mágico: Recalcular Llaves */}
          <button
            onClick={handleRecalculateBrackets}
            disabled={isRecalculating}
            className="cursor-pointer group relative flex items-center gap-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black uppercase tracking-[0.1em] py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="text-2xl group-hover:animate-spin">🪄</span>
            <span>
              {isRecalculating ? "Calculando..." : "Recalcular Llaves"}
            </span>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </button>
        </div>

        <div className="flex flex-col items-center bg-red-950/10 p-8 rounded-2xl border border-red-900/20">
          <div className="flex items-center gap-2 text-red-500 font-black text-sm tracking-widest uppercase mb-6 animate-pulse">
            <AlertOctagon size={18} />
            Zona de Peligro
          </div>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="cursor-pointer w-full md:w-auto flex items-center justify-center gap-3 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white font-bold uppercase tracking-widest py-4 px-12 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]"
          >
            <span className="text-xl">☢️</span>
            {isResetting
              ? "BORRANDO DATOS..."
              : "BORRAR DATOS OFICIALES (RESET)"}
          </button>
          <p className="text-red-400/60 text-xs mt-4 italic font-medium tracking-wide">
            Solo usar antes del torneo. Borra marcadores y correcciones.
          </p>
        </div>
      </div>

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </div>
  );
};
