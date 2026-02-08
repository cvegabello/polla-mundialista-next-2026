"use client";

import React, { useRef, useEffect } from "react";
import { ChevronDown, Check, LucideIcon } from "lucide-react";

interface CustomSelectProps {
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  disabled?: boolean; // 👇 Nuevo prop opcional
}

export const CustomSelect = ({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  isOpen,
  setIsOpen,
  disabled, // Lo recibimos
}: CustomSelectProps) => {
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

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative group z-20" ref={containerRef}>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
        <Icon
          className={`h-5 w-5 transition-colors duration-300 ${
            isOpen ? "text-cyan-400" : "text-gray-400 group-hover:text-gray-300"
          }`}
        />
      </div>

      <button
        type="button"
        disabled={disabled} // 👇 Bloqueamos el botón nativo
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-5 py-3.5 text-left text-sm rounded-full ring-1 shadow-sm transition-all duration-300 outline-none flex items-center justify-between cursor-pointer
          ${
            isOpen
              ? "bg-black/80 ring-cyan-500/50 text-white shadow-cyan-500/20"
              : "bg-black/40 ring-blue-500/20 text-gray-300 hover:bg-black/60 hover:ring-blue-400/50 hover:text-white"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""} // 👇 Estilo visual de deshabilitado
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

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-[100] animate-fade-in-up ring-1 ring-white/5">
          <div className="p-1.5 space-y-1 max-h-60 overflow-y-auto">
            {options.map((opt) => (
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
