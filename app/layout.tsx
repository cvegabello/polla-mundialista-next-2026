import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Si no usa fuentes de Google, comente esto
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // <--- 1. ¡OJO AQUÍ! IMPORTAR ESTO
import { StarBackground } from "@/components/shared/StarBackground";

// const inter = Inter({ subsets: ["latin"] }); // Si no usa fuentes, comente esto

export const metadata: Metadata = {
  title: "Polla Mundialista 2026",
  description: "La mejor polla del mundo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. ¡OJO AQUÍ! Agregue 'suppressHydrationWarning' al html
    <html lang="es" suppressHydrationWarning>
      {/* Si comentó la fuente arriba, quite className={inter.className} de abajo */}
      <body className="antialiased">
        {/* 3. ¡OJO AQUÍ! ESTE ES EL ENCHUFE QUE FALTA */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StarBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
