"use client";

import React from "react";
import {
  User,
  Lock,
  Globe,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface LoginFormProps {
  language: string;
  setLanguage: (value: string) => void;
  isLangOpen: boolean;
  setIsLangOpen: (value: boolean) => void;
  username: string;
  setUsername: (value: string) => void;
  pin: string;
  setPin: (value: string) => void;
  handleLogin: () => void;
  loading: boolean;
  errorMsg: string;
}

export const LoginForm = ({
  language,
  setLanguage,
  isLangOpen,
  setIsLangOpen,
  username,
  setUsername,
  pin,
  setPin,
  handleLogin,
  loading,
  errorMsg,
}: LoginFormProps) => {
  const langOptions = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
  ];

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

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

        <form className="space-y-6" onSubmit={onFormSubmit}>
          {/* 1. USUARIO */}
          <div className="relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <User className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              disabled={loading}
              placeholder={language === "es" ? "USUARIO" : "USERNAME"}
              className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm shadow-sm outline-none block transition-all duration-300 bg-black/40 text-gray-300 ring-1 ring-blue-500/20 placeholder:text-gray-500 hover:bg-black/60 hover:ring-blue-400/50 hover:text-white focus:bg-black/80 focus:ring-2 focus:ring-cyan-500 focus:text-white disabled:opacity-50 uppercase"
            />
          </div>

          {/* 2. PIN */}
          <div className="relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Lock className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
            </div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={loading}
              placeholder="PIN"
              className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm shadow-sm outline-none block transition-all duration-300 tracking-widest font-mono bg-black/40 text-gray-300 ring-1 ring-blue-500/20 placeholder:text-gray-500 hover:bg-black/60 hover:ring-blue-400/50 hover:text-white focus:bg-black/80 focus:ring-2 focus:ring-cyan-500 focus:text-white disabled:opacity-50"
            />
          </div>

          {/* ERROR MSG */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-3 rounded-lg border border-red-500/20 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className={`
              group relative w-full py-4 px-4 rounded-full 
              bg-gradient-to-r from-[#0f172a] to-[#1e293b] 
              hover:from-blue-900/80 hover:to-cyan-900/80 
              border border-white/10 hover:border-cyan-500/50 
              text-gray-300 hover:text-white font-semibold tracking-[0.2em] text-xs uppercase
              shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] 
              transform transition-all duration-300 ease-out 
              hover:-translate-y-0.5 active:scale-[0.98] 
              cursor-pointer flex items-center justify-center gap-2
              overflow-hidden z-10
              ${loading ? "opacity-80 cursor-wait" : ""}
            `}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>
                  {language === "es" ? "Verificando..." : "Checking..."}
                </span>
              </div>
            ) : (
              <>
                <span>{language === "es" ? "Ingresar" : "Sign In"}</span>
                <ArrowRight className="h-4 w-4 text-cyan-500 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest opacity-40">
          FIFA World Cup 2026
        </p>
      </div>
    </div>
  );
};
