"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Evitamos errores de hidratación esperando a que cargue en el cliente
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Espacio vacío mientras carga
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all hover:scale-110 relative w-9 h-9 flex items-center justify-center"
      aria-label="Cambiar tema"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500 absolute" />
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400 absolute" />
    </button>
  );
}
