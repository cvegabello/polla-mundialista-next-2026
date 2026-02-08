"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Lock,
  Users,
  Globe,
  ChevronDown,
  Check,
  ArrowRight,
} from "lucide-react";

// --- COMPONENTE INTERNO: CUSTOM SELECT ---
const CustomSelect = ({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  isOpen,
  setIsOpen,
}: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const selectedLabel = options.find((opt: any) => opt.value === value)?.label;

  return (
    <div className="relative group z-20" ref={containerRef}>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
        <Icon
          className={`h-5 w-5 transition-colors duration-300 ${isOpen ? "text-cyan-400" : "text-gray-400 group-hover:text-gray-300"}`}
        />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-5 py-3.5 text-left text-sm rounded-full ring-1 shadow-sm block transition-all duration-300 outline-none flex items-center justify-between cursor-pointer
          ${
            isOpen
              ? "bg-black/80 ring-cyan-500/50 text-white shadow-cyan-500/20"
              : "bg-black/40 ring-blue-500/20 text-gray-300 hover:bg-black/60 hover:ring-blue-400/50 hover:text-white"
          }
        `}
      >
        <span
          className={`truncate ${value ? "text-gray-100" : "text-gray-400"}`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan-400" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-[100] animate-fade-in-up ring-1 ring-white/5">
          <div className="p-1.5 space-y-1">
            {options.map((opt: any) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm group text-left
                  ${
                    value === opt.value
                      ? "bg-blue-600/20 text-cyan-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                  }
                `}
              >
                <span className="font-medium">{opt.label}</span>
                {value === opt.value && (
                  <Check className="h-4 w-4 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const LoginMockup = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const deviceLang =
    typeof window !== "undefined" && navigator.language.startsWith("en")
      ? "en"
      : "es";
  const [language, setLanguage] = useState(deviceLang);

  const [group, setGroup] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // ⚠️ RUTA DE IMÁGENES
  const backgrounds = [
    "/login/fondo1.avif",
    "/login/fondo2.avif",
    "/login/fondo3.png",
  ];

  const groupOptions = [
    { value: "ofi", label: "Polla Oficina" },
    { value: "fam", label: "Familia Pérez" },
    { value: "new", label: "+ Crear nueva..." },
  ];

  const langOptions = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black via-[#020205] to-[#0a1e3b] p-4 md:p-8 relative overflow-hidden">
      {/* WRAPPER BORDE ILUMINADO PRINCIPAL */}
      <div className="w-full max-w-5xl p-[2px] rounded-[26px] bg-gradient-to-br from-cyan-400/50 via-blue-500/30 to-gray-300/20 shadow-2xl relative z-10">
        {/* TARJETA PRINCIPAL */}
        <div className="w-full h-full bg-gradient-to-t from-[#050505] to-[#252525] rounded-3xl flex flex-col md:flex-row p-3">
          {/* --- IZQUIERDA: FOTOS CON BORDE ILUMINADO --- */}
          {/* Aquí aplicamos el mismo degradado del borde principal (wrapper) a la tarjeta interna */}
          <div className="relative w-full md:w-1/2 h-64 md:h-auto rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/50 via-blue-500/30 to-gray-300/20 shadow-lg">
            {/* Contenedor interno de las fotos (recorta el contenido) */}
            <div className="w-full h-full rounded-2xl overflow-hidden relative group">
              {/* Capa oscura */}
              <div className="absolute inset-0 bg-black/30 z-10" />

              {backgrounds.map((bg, index) => (
                <div
                  key={index}
                  // BLUR CONTROL: Ajuste aquí el nivel de desenfoque (blur-[2px], blur-none, etc.)
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out filter scale-105 ${
                    index === currentBgIndex ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundImage: `url(${bg})` }}
                />
              ))}
            </div>
          </div>

          {/* --- DERECHA: FORMULARIO --- */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
            <div className="w-full max-w-sm animate-fade-in-up">
              {/* SIN LOGO AQUÍ (ELIMINADO A PETICIÓN) */}

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
                {/* 1. GRUPO */}
                <div className="relative z-30">
                  <CustomSelect
                    icon={Users}
                    value={group}
                    onChange={setGroup}
                    options={groupOptions}
                    placeholder={
                      language === "es"
                        ? "Selecciona tu Polla..."
                        : "Select Pool..."
                    }
                    isOpen={isGroupOpen}
                    setIsOpen={(val: boolean) => {
                      setIsGroupOpen(val);
                      setIsLangOpen(false);
                    }}
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
                    className="
                      w-full pl-12 pr-5 py-3.5 rounded-full text-sm shadow-sm outline-none block transition-all duration-300
                      bg-black/40 text-gray-300 ring-1 ring-blue-500/20 placeholder:text-gray-500
                      hover:bg-black/60 hover:ring-blue-400/50 hover:text-white
                      focus:bg-black/80 focus:ring-2 focus:ring-cyan-500 focus:text-white
                    "
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
                    className="
                      w-full pl-12 pr-5 py-3.5 rounded-full text-sm shadow-sm outline-none block transition-all duration-300 tracking-widest font-mono
                      bg-black/40 text-gray-300 ring-1 ring-blue-500/20 placeholder:text-gray-500
                      hover:bg-black/60 hover:ring-blue-400/50 hover:text-white
                      focus:bg-black/80 focus:ring-2 focus:ring-cyan-500 focus:text-white
                    "
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
                  className="
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
                  "
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
        </div>
      </div>
    </div>
  );
};
