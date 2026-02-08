"use client";

import React, { useState, useEffect } from "react";

export const LoginImageCard = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // DEFINICIÓN DE IMÁGENES (Ahora viven aquí adentro)
  const backgrounds = [
    "/login/fondo1.avif",
    "/login/fondo2.avif",
    "/login/fondo3.png",
  ];

  // Lógica del carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    // CORRECCIÓN: Usamos 'bg-linear-to-br' en el borde
    <div className="relative w-full md:w-1/2 h-64 md:h-auto rounded-2xl p-px bg-linear-to-br from-cyan-400/50 via-blue-500/30 to-gray-300/20 shadow-lg">
      <div className="w-full h-full rounded-2xl overflow-hidden relative group">
        {/* Capa oscura */}
        <div className="absolute inset-0 bg-black/30 z-10" />

        {/* Imágenes rotativas */}
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out filter scale-105 ${
              index === currentBgIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
      </div>
    </div>
  );
};
