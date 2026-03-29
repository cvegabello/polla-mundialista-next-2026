"use client";

import React from "react";
import Image from "next/image"; // 👈 IMPORTANTE: Para optimizar el logo
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import {
  LayoutDashboard,
  Trophy,
  ShieldCheck,
  Medal,
  MonitorPlay,
  Save,
  RefreshCw,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface FanNavigationProps {
  lang: Language;
  currentView: string;
  onViewChange: (view: string) => void;
  username: string;
  pollaName?: string;
  points: number;
  submissionDate: string | null;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  onOpenVar: () => void;
}

export const FanNavigation = ({
  lang,
  currentView,
  onViewChange,
  username,
  pollaName,
  points,
  submissionDate,
  hasUnsavedChanges,
  onManualSave,
  onRefresh,
  onLogout,
  onOpenVar,
}: FanNavigationProps) => {
  const t = DICTIONARY[lang];
  const isOfficial = !!submissionDate;

  // 📂 ESTRUCTURA AGRUPADA DEL MENÚ
  // 📂 ESTRUCTURA AGRUPADA DEL MENÚ (Con tipado estricto para que TS no llore)
  const menuGroups: {
    title: string;
    items: {
      id: string;
      label: string;
      icon: React.ReactNode;
      isAction?: boolean;
    }[]; // 👈 El "?" lo hace opcional
  }[] = [
    {
      title: lang === "en" ? "My Predictions" : "Mis Pronósticos",
      items: [
        {
          id: "pred_groups",
          label: lang === "en" ? "Groups" : "Fase de Grupos",
          icon: <LayoutDashboard size={20} />,
        },
        {
          id: "pred_finals",
          label: lang === "en" ? "Finals" : "Fase Final",
          icon: <Trophy size={20} />,
        },
      ],
    },
    {
      title: lang === "en" ? "FIFA Results" : "Resultados FIFA",
      items: [
        {
          id: "res_groups",
          label: lang === "en" ? "View Groups" : "Ver Grupos",
          icon: <ShieldCheck size={20} />,
        },
        {
          id: "res_finals",
          label: lang === "en" ? "View Finals" : "Ver Finales",
          icon: <Medal size={20} />,
        },
      ],
    },
    {
      title: lang === "en" ? "Reports" : "Reportes",
      items: [
        {
          id: "var",
          label: lang === "en" ? "The VAR" : "El VAR",
          icon: <MonitorPlay size={20} />,
          isAction: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* ========================================= */}
      {/* 🖥️ TOPBAR FIJA (Escritorio y Móvil)       */}
      {/* ========================================= */}
      <header className="fixed top-0 left-0 w-full h-16 bg-[#0a0b10]/95 backdrop-blur-md border-b border-orange-500/20 z-50 flex items-center justify-between px-4 shadow-lg">
        {/* IZQUIERDA: Logo del Mundial + Título */}
        {/* 👇 NUEVA SECCIÓN DEL LOGO 👇 */}
        {/* 👇 Ajustamos w-auto en celular y w-[300px] en PC */}
        <div className="flex items-center gap-2 md:gap-3 w-auto md:w-[300px] shrink-0">
          <Image
            src="/images/wc-log.webp"
            alt="FIFA World Cup 2026 Logo"
            width={60}
            height={60}
            // 👇 MAGIA RESPONSIVA: h-7 en celular, h-10 en PC (md) 👇
            className="h-9 md:h-10 w-10 md:w-auto object-contain invert brightness-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] filter-none"
          />
          <span className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            {lang === "en" ? "WORLD CUP 26" : "COPA MUNDIAL 26"}
          </span>
        </div>
        {/* 👆 FIN SECCIÓN DEL LOGO 👆 */}

        {/* CENTRO: La Pastilla de Usuario (Estrecha y Elegante) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center justify-between px-5 py-1.5 rounded-full bg-[#0f1016] border border-orange-300/50 shadow-md min-w-[320px] max-w-[400px]">
            {/* Nombre y Polla */}
            <div className="flex flex-col">
              <span className="text-cyan-400 font-bold text-[13px] uppercase leading-tight tracking-wider">
                {username}
              </span>
              <span className="text-[10px] text-orange-400 font-semibold flex items-center gap-1 leading-tight">
                <Trophy size={10} /> {pollaName || "Torneo"}
              </span>
            </div>

            {/* Semáforo Oficial/Borrador */}
            <div
              className={`px-3 py-0.5 mx-4 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                isOfficial
                  ? "bg-green-900/30 border-green-600 text-green-400"
                  : "bg-yellow-600/20 border-yellow-600 text-yellow-500"
              }`}
            >
              {isOfficial
                ? lang === "en"
                  ? "Official"
                  : "Oficial"
                : lang === "en"
                  ? "Draft"
                  : "Borrador"}
            </div>

            {/* Puntos */}
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold leading-tight">
                {lang === "en" ? "Points" : "Puntos"}
              </span>
              <span className="text-white font-black text-lg leading-tight drop-shadow-md">
                {points}
              </span>
            </div>
          </div>
        </div>

        {/* DERECHA: Acciones (Refrescar, Guardar, Salir) */}
        {/* DERECHA: Acciones (Refrescar, Guardar, Salir) */}
        <div className="flex items-center gap-1 sm:gap-3 w-auto justify-end shrink-0">
          <ThemeToggle />

          <button
            onClick={onRefresh}
            className="cursor-pointer p-2 sm:px-3 sm:py-1.5 flex items-center gap-2 text-cyan-400 hover:bg-cyan-950/50 rounded-lg transition-colors border border-transparent hover:border-cyan-900"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:block text-xs font-bold uppercase">
              {lang === "en" ? "Refresh" : "Refrescar"}
            </span>
          </button>

          <button
            onClick={onManualSave}
            disabled={!hasUnsavedChanges}
            className={`p-2 sm:px-3 sm:py-1.5 flex items-center gap-2 rounded-lg font-bold text-xs uppercase transition-all ${
              hasUnsavedChanges
                ? "bg-amber-500/20 text-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse cursor-pointer"
                : "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700"
            }`}
          >
            <Save size={16} />
            <span className="hidden sm:block">
              {hasUnsavedChanges
                ? lang === "en"
                  ? "Save"
                  : "Guardar"
                : lang === "en"
                  ? "Saved"
                  : "Guardado"}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="cursor-pointer p-2 sm:px-3 sm:py-1.5 flex items-center gap-2 text-red-500 hover:bg-red-950/50 rounded-lg transition-colors border border-transparent hover:border-red-900"
          >
            <LogOut size={16} />
            <span className="hidden sm:block text-xs font-bold uppercase">
              {t.menuExit || (lang === "en" ? "Logout" : "Salir")}
            </span>
          </button>
        </div>
      </header>

      {/* ========================================= */}
      {/* 🖥️ SIDEBAR COLAPSABLE (Solo Escritorio)   */}
      {/* ========================================= */}
      <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 hover:w-64 bg-[#0a0b10]/95 backdrop-blur-xl border-r border-orange-500/20 transition-all duration-300 z-40 flex-col py-6 overflow-x-hidden group shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 w-64 px-3">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              {/* Título de Categoría (Se revela al hacer hover) */}
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {group.title}
              </span>

              {/* Items de la Categoría */}
              {group.items.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      item.isAction ? onOpenVar() : onViewChange(item.id)
                    }
                    title={item.label} // Tooltip nativo para cuando está colapsado
                    className={`flex items-center w-[232px] h-10 rounded-xl transition-all duration-300 relative cursor-pointer ${
                      isActive && !item.isAction
                        ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30"
                        : item.isAction
                          ? "text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    {/* Indicador activo lateral */}
                    {isActive && !item.isAction && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    )}

                    {/* Ícono siempre visible */}
                    <div className="w-10 flex justify-center shrink-0">
                      {item.icon}
                    </div>

                    {/* Etiqueta visible al expandir */}
                    <span className="text-sm font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Decoración inferior */}
        <div className="mt-auto px-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
              <Trophy size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-300">
                {lang === "en" ? "World Cup 2026" : "Copa Mundial 2026"}
              </span>
              <span className="text-[10px] text-gray-500">
                {lang === "en" ? "Special Edition" : "Edición Especial"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================= */}
      {/* 📱 BOTTOM BAR (Solo Móvil)                */}
      {/* ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#0a0b10]/95 backdrop-blur-xl border-t border-orange-500/30 z-50 flex items-center justify-around px-2 pb-safe">
        {menuGroups
          .flatMap((g) => g.items)
          .map((item) => (
            <button
              key={item.id}
              onClick={() =>
                item.isAction ? onOpenVar() : onViewChange(item.id)
              }
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors cursor-pointer ${
                currentView === item.id && !item.isAction
                  ? "text-cyan-400"
                  : item.isAction
                    ? "text-yellow-600"
                    : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[60px] text-center">
                {item.label}
              </span>
            </button>
          ))}
      </nav>
    </>
  );
};
