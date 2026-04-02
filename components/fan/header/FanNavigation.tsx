"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  Share2,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// 👇 RUTA ACTUALIZADA DEL MODAL DE INVITACIÓN
import { FanInviteModal } from "@/components/fan/modals/FanInviteModal";

interface FanNavigationProps {
  lang: Language;
  currentView: string;
  onViewChange: (view: string) => void;
  username: string;
  pollaId: string;
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
  pollaId,
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

  // 🚀 ESTADOS
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 📂 ESTRUCTURA AGRUPADA DEL MENÚ
  const menuGroups: {
    title: string;
    items: {
      id: string;
      label: string;
      icon: React.ReactNode;
      isAction?: boolean;
    }[];
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

  const handleNavigation = (id: string, isAction?: boolean) => {
    if (isAction) {
      onOpenVar();
    } else {
      onViewChange(id);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ========================================= */}
      {/* 🖥️ TOPBAR FIJA (Escritorio, iPad y Móvil) */}
      {/* ========================================= */}
      <header className="fixed top-0 left-0 w-full h-16 bg-[#0a0b10]/95 backdrop-blur-md border-b border-orange-500/20 z-40 flex items-center justify-between px-2 lg:px-4 shadow-lg bg-[url('/images/headers/FanNavigationHeader_FIFACup_NewYorkNewJersey.webp')] bg-cover bg-center">
        {/* IZQUIERDA: Logo del Mundial */}
        <div className="flex items-center gap-2 w-[60px] md:w-[140px] lg:w-[300px] shrink-0 md:pl-10">
          <Image
            src="/images/wc-log.webp"
            alt="FIFA World Cup 2026 Logo"
            width={60}
            height={60}
            className="h-8 md:h-16 lg:h-10 w-10 md:w-16 lg:w-auto object-contain invert brightness-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] filter-none"
          />
          <span className="hidden lg:block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            {lang === "en" ? "WORLD CUP 26" : "COPA MUNDIAL 26"}
          </span>
        </div>

        {/* CENTRO: La Galletica de Usuario */}
        <div className="flex flex-1 justify-center mx-1 sm:mx-2 min-w-0 md:max-w-none">
          <div className="flex items-center justify-center lg:justify-between gap-2 sm:gap-4 md:gap-6 lg:gap-0 px-3 md:px-5 lg:px-6 py-1 md:py-1.5 rounded-full bg-[#0f1016]/90 border border-orange-300/50 shadow-md w-auto md:min-w-[400px] lg:min-w-[440px] max-w-full backdrop-blur-sm bg-[url('/images/card-backgrounds/md:landscape:landscape_FIFACup_NewYorkNewJersey.jpg')] bg-cover bg-center">
            {/* Nombre y Polla */}
            <div className="flex flex-col min-w-0 shrink lg:w-1/3 lg:items-start">
              <span className="text-cyan-400 font-bold text-[10px] md:text-[14px] lg:text-[15px] uppercase leading-tight tracking-wider truncate max-w-[80px] sm:max-w-[120px] md:max-w-[160px] lg:max-w-full">
                {username}
              </span>
              <span className="text-[8px] md:text-[10px] lg:text-[11px] text-orange-400 font-semibold flex items-center gap-1 lg:gap-1.5 leading-tight truncate">
                <Trophy className="hidden sm:block shrink-0 w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="truncate">{pollaName || "Torneo"}</span>
              </span>
            </div>

            {/* Semáforo Oficial/Borrador */}
            <div className="flex justify-center shrink-0 lg:w-1/3">
              <div
                className={`px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border shrink-0 ${
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
            </div>

            {/* Puntos */}
            <div className="flex flex-col items-center lg:items-end shrink-0 lg:w-1/3">
              <span className="hidden sm:block text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-tight">
                {lang === "en" ? "Points" : "Puntos"}
              </span>
              <span className="text-white font-black text-sm md:text-xl lg:text-2xl leading-tight drop-shadow-md">
                {points}
              </span>
            </div>
          </div>
        </div>

        {/* DERECHA: Acciones / Hamburguesa */}
        <div className="flex items-center justify-end w-[60px] md:w-[140px] lg:w-[300px] shrink-0 gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="cursor-pointer p-2 px-3 py-1.5 flex items-center gap-2 text-emerald-400 hover:bg-emerald-950/50 rounded-lg transition-colors border border-transparent hover:border-emerald-900"
            >
              <Share2 size={16} />
              <span className="text-xs font-bold uppercase">
                {lang === "en" ? "Invite" : "Invitar"}
              </span>
            </button>

            <button
              onClick={onRefresh}
              className="cursor-pointer p-2 px-3 py-1.5 flex items-center gap-2 text-cyan-400 hover:bg-cyan-950/50 rounded-lg transition-colors border border-transparent hover:border-cyan-900"
            >
              <RefreshCw size={16} />
              <span className="text-xs font-bold uppercase">
                {lang === "en" ? "Refresh" : "Refrescar"}
              </span>
            </button>

            <button
              onClick={onManualSave}
              disabled={!hasUnsavedChanges}
              className={`p-2 px-3 py-1.5 flex items-center gap-2 rounded-lg font-bold text-xs uppercase transition-all ${
                hasUnsavedChanges
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse cursor-pointer"
                  : "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
            >
              <Save size={16} />
              <span>
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
              className="cursor-pointer p-2 px-3 py-1.5 flex items-center gap-2 text-red-500 hover:bg-red-950/50 rounded-lg transition-colors border border-transparent hover:border-red-900"
            >
              <LogOut size={16} />
              <span className="text-xs font-bold uppercase">
                {t.menuExit || (lang === "en" ? "Logout" : "Salir")}
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
          >
            <Menu className="w-[26px] h-[26px] md:w-8 md:h-8" />
          </button>
        </div>
      </header>

      {/* ========================================= */}
      {/* 🍔 DRAWER / MENÚ HAMBURGUESA (Solo Móvil/iPad) */}
      {/* ========================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="relative w-3/4 max-w-[280px] h-full bg-[#0a0b10] border-r border-orange-500/30 shadow-[4px_0_24px_rgba(0,0,0,0.8)] flex flex-col py-6 px-4 animate-in slide-in-from-left duration-300 bg-[url('/images/backgrounds/FanHamburguerBackground_FIFACup_NewYorkNewJersey.webp')] bg-cover bg-center">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-gray-800/50 rounded-full p-1"
            >
              <X size={24} />
            </button>

            <div className="mb-8 flex items-center gap-3 border-b border-orange-500/20 pb-4">
              <Image
                src="/images/wc-log.webp"
                alt="Logo"
                width={40}
                height={40}
                className="invert brightness-110 object-contain"
              />
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 uppercase tracking-widest">
                MENÚ
              </span>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1 pb-20">
              {menuGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col gap-2">
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1">
                    {group.title}
                  </span>

                  {group.items.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id, item.isAction)}
                        className={`flex items-center gap-3 w-full h-12 px-3 rounded-xl transition-all duration-300 relative cursor-pointer ${
                          isActive && !item.isAction
                            ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30 font-bold"
                            : item.isAction
                              ? "text-yellow-500 hover:bg-yellow-500/10 font-bold"
                              : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {isActive && !item.isAction && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        )}
                        <div className="shrink-0">{item.icon}</div>
                        <span className="text-sm tracking-wide text-left flex-1">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🖥️ SIDEBAR COLAPSABLE (Solo Escritorio PC)*/}
      {/* ========================================= */}
      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 hover:w-64 bg-[#0a0b10]/95 backdrop-blur-xl border-r border-orange-500/20 transition-all duration-300 z-30 flex-col py-6 overflow-x-hidden group shadow-[4px_0_24px_rgba(0,0,0,0.5)] bg-[url('/images/card-backgrounds/md:landscape:landscape_FIFACup_NewYorkNewJersey.jpg')] bg-cover bg-center">
        <div className="flex flex-col gap-6 w-64 px-3">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {group.title}
              </span>

              {group.items.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id, item.isAction)}
                    title={item.label}
                    className={`flex items-center w-[232px] h-10 rounded-xl transition-all duration-300 relative cursor-pointer ${
                      isActive && !item.isAction
                        ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30"
                        : item.isAction
                          ? "text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    {isActive && !item.isAction && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    )}

                    <div className="w-10 flex justify-center shrink-0">
                      {item.icon}
                    </div>

                    <span className="text-sm font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-auto px-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 flex items-center gap-3 bg-[url('/images/backgrounds/TrophyBonusBackground_FIFACup_NewYorkNewJersey.webp')] bg-cover bg-center">
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
      {/* 📱 BOTTOM BAR - ACCIONES (Solo Móvil/iPad) */}
      {/* ========================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-[#0a0b10]/95 backdrop-blur-xl border-t border-orange-500/30 z-40 flex items-center justify-center px-1 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-0.5">
          <div className="transform scale-75 origin-center mb-[-4px]">
            <ThemeToggle />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[90%] text-center px-0.5 text-gray-500">
            {lang === "en" ? "Theme" : "Tema"}
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-1 transition-colors cursor-pointer text-cyan-400 hover:text-cyan-300"
        >
          <RefreshCw size={20} />
          <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[90%] text-center px-0.5">
            {lang === "en" ? "Refresh" : "Refrescar"}
          </span>
        </button>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors cursor-pointer group"
        >
          <div className="relative -top-2 p-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-full shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-transform active:scale-95 border-2 border-[#0a0b10] mb-[-12px] bg-[url('/images/backgrounds/InviteBonusBackground_FIFACup_NewYorkNewJersey.webp')] bg-cover bg-center">
            <Share2 size={20} className="relative z-10" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[90%] text-center px-0.5 text-emerald-400 mt-1">
            {lang === "en" ? "Invite" : "Invitar"}
          </span>
        </button>

        <button
          onClick={onManualSave}
          disabled={!hasUnsavedChanges}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-1 transition-colors ${
            hasUnsavedChanges
              ? "text-amber-400 cursor-pointer"
              : "text-gray-600 cursor-not-allowed"
          }`}
        >
          <div
            className={
              hasUnsavedChanges
                ? "animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.3)] rounded-full"
                : ""
            }
          >
            <Save size={20} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[90%] text-center px-0.5">
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
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-1 transition-colors cursor-pointer text-red-500 hover:text-red-400"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[90%] text-center px-0.5">
            {t.menuExit || (lang === "en" ? "Logout" : "Salir")}
          </span>
        </button>
      </nav>

      {/* 🚀 MODAL DE INVITACIÓN */}
      <FanInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        pollaId={pollaId}
        pollaName={pollaName || ""}
        initialLang={lang}
      />
    </>
  );
};
