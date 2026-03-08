"use client";

import React, { useState, useEffect } from "react";
import { Settings, Users, AlertOctagon } from "lucide-react";
import {
  getGlobalConfigAction,
  togglePhaseAction,
} from "@/lib/actions/admin-config-actions";

export const SystemConfigPanel = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargamos la configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      const data = await getGlobalConfigAction();
      if (data) setConfig(data);
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleTogglePhase = async (column: string, currentValue: boolean) => {
    const newValue = !currentValue;

    // 👇 LA CIRUGÍA: Solo asustamos y preguntamos si NO es la Fase de Grupos
    if (newValue && column !== "allow_groups") {
      const isConfirmed = window.confirm(
        "¡ATENCIÓN! Al abrir esta fase, se borrarán los pronósticos imaginarios de todos los fans de esta fase en adelante y se les habilitará la plataforma para que vuelvan a pronosticar con las llaves oficiales. ¿Está seguro?",
      );
      if (!isConfirmed) return;
    }

    // Actualizamos la UI inmediatamente para que se sienta rápido
    setConfig({ ...config, [column]: newValue });

    // 👇 Le mandamos un tercer parámetro al servidor: ¿debe borrar o no?
    const shouldClearPredictions = newValue && column !== "allow_groups";
    await togglePhaseAction(column, newValue, shouldClearPredictions);
  };

  if (loading)
    return (
      <div className="text-orange-400 animate-pulse text-center p-8 font-bold tracking-widest">
        CARGANDO SISTEMA...
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-[2px] rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] mt-8">
      <div className="bg-[#0f1016] rounded-2xl p-6 md:p-10 w-full h-full border border-slate-800/80">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-center gap-3 mb-12 pb-6 border-b border-white/5">
          <Settings className="text-orange-500" size={32} />
          <h2 className="text-2xl md:text-3xl font-black text-orange-500 tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(249,115,22,0.4)]">
            Configuración & Reglas
          </h2>
        </div>

        {/* SECCIÓN 1: FASES */}
        <div className="mb-12">
          <p className="text-slate-400 font-bold text-sm mb-6 tracking-widest uppercase text-center">
            Habilitar Fases{" "}
            <span className="text-orange-400 lowercase font-normal">
              (check para abrir)
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 bg-black/30 p-8 rounded-2xl border border-white/5 shadow-inner">
            {[
              { label: "Grupos", col: "allow_groups" },
              { label: "16avos", col: "allow_r32" },
              { label: "8vos", col: "allow_r16" },
              { label: "Cuartos", col: "allow_qf" },
              { label: "Semis", col: "allow_sf" },
              { label: "Final", col: "allow_f" },
            ].map((phase) => (
              <label
                key={phase.col}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  config?.[phase.col]
                    ? "bg-orange-950/40 border-orange-500/60 text-orange-200 shadow-[0_5px_15px_rgba(249,115,22,0.2)]"
                    : "bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-orange-500 cursor-pointer rounded bg-slate-800 border-slate-600"
                  checked={config?.[phase.col] || false}
                  onChange={() =>
                    handleTogglePhase(phase.col, config?.[phase.col])
                  }
                />
                <span className="font-bold text-sm uppercase tracking-wider">
                  {phase.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SECCIÓN 2: GESTIÓN DE USUARIOS */}
        <div className="flex justify-center mt-8 mb-14 border-b border-white/5 pb-12">
          <button className="cursor-pointer group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] py-4 px-16 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 border border-blue-400/30">
            <Users size={24} className="group-hover:animate-bounce" />
            <span>Gestionar Usuarios</span>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </button>
        </div>

        {/* SECCIÓN 3: ZONA DE PELIGRO */}
        <div className="flex flex-col items-center bg-red-950/10 p-8 rounded-2xl border border-red-900/20">
          <div className="flex items-center gap-2 text-red-500 font-black text-sm tracking-widest uppercase mb-6 animate-pulse">
            <AlertOctagon size={18} />
            Zona de Peligro
          </div>
          <button className="cursor-pointer w-full md:w-auto flex items-center justify-center gap-3 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white font-bold uppercase tracking-widest py-4 px-12 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]">
            <span className="text-xl">☢️</span>
            Borrar Datos Oficiales (Reset)
          </button>
          <p className="text-red-400/60 text-xs mt-4 italic font-medium tracking-wide">
            Solo usar antes del torneo. Borra marcadores y correcciones.
          </p>
        </div>
      </div>
    </div>
  );
};
