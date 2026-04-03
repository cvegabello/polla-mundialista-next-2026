import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Esto elimina todos los console.log en Producción mágicamente
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
