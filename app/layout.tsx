import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google"; // Si no usa fuentes de Google, comente esto
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // <--- 1. ¡OJO AQUÍ! IMPORTAR ESTO
import { StarBackground } from "@/components/shared/StarBackground";

// const inter = Inter({ subsets: ["latin"] }); // Si no usa fuentes, comente esto

// 📱 1. CONFIGURACIÓN VISUAL PARA CELULARES (El color de la barra de Android/iOS)
export const viewport: Viewport = {
  themeColor: "#f97316", // Naranja Mundialista
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Evita que la pantalla haga zoom raro al tocar botones
};

// 🚀 2. CONFIGURACIÓN DE LA APP NATIVA (PWA)
export const metadata: Metadata = {
  title: "TiqueBet",
  description: "World Cup 2026 Predictions",
  manifest: "/manifest.json", // Conecta con el archivo que creamos
  appleWebApp: {
    capable: true, // Le dice a Apple que se puede instalar como App
    statusBarStyle: "black-translucent", // Barra de estado transparente/negra
    title: "TiqueBet", // El nombre que saldrá debajo del ícono en el celular
  },
  icons: {
    apple: "/images/wc-log.webp", // El ícono para los iPhone
  },
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
