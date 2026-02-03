"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Si le sale error en la siguiente línea, borre 'type' o asegúrese de tener next-themes instalado
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
