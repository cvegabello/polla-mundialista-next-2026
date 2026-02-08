"use client";

import React from "react";
import { User, Lock, Users, Globe, ArrowRight } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

// Definimos qué datos recibe este componente desde el Padre
interface LoginFormProps {
  group: string;
  setGroup: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  isGroupOpen: boolean;
  setIsGroupOpen: (value: boolean) => void;
  isLangOpen: boolean;
  setIsLangOpen: (value: boolean) => void;
  // 👇 AQUÍ ESTÁN LOS NUEVOS PROPS
  poolOptions: { value: string; label: string }[];
  isLoadingPools: boolean;
}

export const LoginForm = ({
  group,
  setGroup,
  language,
  setLanguage,
  isGroupOpen,
  setIsGroupOpen,
  isLangOpen,
  setIsLangOpen,
  // 👇 Los recibimos aquí
  poolOptions,
  isLoadingPools,
}: LoginFormProps) => {
  // Idiomas siguen fijos
  const langOptions = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
  ];

  return (
    <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
            {language === "es" ? "Bienvenido" : "Log in"}
          </h2>
          <p className="text-gray-400 text-sm">
            {language === "es"
              ? "Ingresa tus credenciales"
              : "Enter your credentials"}
          </p>
        </div>

        <form className="space-y-6">
          {/* 1. SELECCIÓN DE POLLA (Conectada a la BD) */}
          <div className="relative z-30">
            <CustomSelect
              icon={Users}
              value={group}
              onChange={setGroup}
              // 👇 Lógica: Si carga, muestra "Cargando...", si no, muestra las pollas reales
              options={
                isLoadingPools
                  ? [
                      {
                        value: "",
                        label: language === "es" ? "Cargando..." : "Loading...",
                      },
                    ]
                  : poolOptions
              }
              placeholder={
                language === "es" ? "Selecciona tu Polla..." : "Select Pool..."
              }
              isOpen={isGroupOpen}
              setIsOpen={(val: boolean) => {
                // Solo abre si ya terminó de cargar
                if (!isLoadingPools) {
                  setIsGroupOpen(val);
                  setIsLangOpen(false);
                }
              }}
              disabled={isLoadingPools} // Bloquea el click mientras carga
            />
          </div>

          {/* 2. USUARIO */}
          <div className="relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <User className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
            </div>
            <input
              type="text"
              placeholder={language === "es" ? "Usuario" : "Username"}
              className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm shadow-sm outline-none block transition-all duration-300 bg-black/40 text-gray-300 ring-1 ring-blue-500/20 placeholder:text-gray-500 hover:bg-black/60 hover:ring-blue-400/50 hover:text-white focus:bg-black/80 focus:ring-2 focus:ring-cyan-500 focus:text-white"
            />
          </div>

          {/* 3. PIN */}
          <div className="relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Lock className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
            </div>
            <input
              type="password"
              maxLength={4}
              placeholder="PIN"
              className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm shadow-sm outline-none block transition-all duration-300 tracking-widest font-mono bg-black/40 text-gray-300 ring-1 ring-blue-500/20 placeholder:text-gray-500 hover:bg-black/60 hover:ring-blue-400/50 hover:text-white focus:bg-black/80 focus:ring-2 focus:ring-cyan-500 focus:text-white"
            />
          </div>

          {/* IDIOMA */}
          <div className="flex justify-end pt-1 relative z-20">
            <div className="w-36">
              <CustomSelect
                icon={Globe}
                value={language}
                onChange={setLanguage}
                options={langOptions}
                placeholder="Idioma"
                isOpen={isLangOpen}
                setIsOpen={(val: boolean) => {
                  setIsLangOpen(val);
                  setIsGroupOpen(false);
                }}
              />
            </div>
          </div>

          {/* BOTÓN */}
          <button
            type="button"
            className="group relative w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] hover:from-blue-900/80 hover:to-cyan-900/80 border border-white/10 hover:border-cyan-500/50 text-gray-300 hover:text-white font-semibold tracking-[0.2em] text-xs uppercase shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transform transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <span>{language === "es" ? "Ingresar" : "Sign In"}</span>
            <ArrowRight className="h-4 w-4 text-cyan-500 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest opacity-40">
          FIFA World Cup 2026
        </p>
      </div>
    </div>
  );
};
