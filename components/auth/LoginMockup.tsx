"use client";

import React, { useState, useEffect } from "react";
// 👇 1. Importamos el cliente centralizado (Mucho más limpio)
import { supabase } from "@/lib/supabase";
import { LoginForm } from "@/components/ui/LoginForm";
import { LoginImageCard } from "@/components/ui/LoginImageCard";

export const LoginMockup = () => {
  const deviceLang =
    typeof window !== "undefined" && navigator.language.startsWith("en")
      ? "en"
      : "es";

  // ESTADOS
  const [language, setLanguage] = useState(deviceLang);
  const [group, setGroup] = useState("");

  // Estados de los menús
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // 👇 2. ESTADOS PARA LA DATA DE SUPABASE
  const [poolOptions, setPoolOptions] = useState<any[]>([]); // Lista de pollas
  const [isLoadingPools, setIsLoadingPools] = useState(true); // Carga

  // 👇 3. EFECTO PARA CARGAR LAS POLLAS
  useEffect(() => {
    const fetchPollas = async () => {
      try {
        setIsLoadingPools(true);

        // Consulta a la tabla 'pollas' (id, name)
        const { data, error } = await supabase
          .from("pollas")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error cargando pollas:", error);
        }

        if (data) {
          // Formateamos para el Select: { value: ID, label: NOMBRE }
          const formatted = data.map((polla) => ({
            value: polla.id, // El valor interno es el UUID
            label: polla.name, // Lo que ve el usuario
          }));
          setPoolOptions(formatted);
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      } finally {
        setIsLoadingPools(false);
      }
    };

    fetchPollas();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-black via-[#020205] to-[#0a1e3b] p-4 md:p-8 relative overflow-hidden">
      {/* WRAPPER */}
      <div className="w-full max-w-5xl p-[2px] rounded-[26px] bg-linear-to-br from-cyan-400/50 via-blue-500/30 to-gray-300/20 shadow-2xl relative z-10">
        {/* TARJETA */}
        <div className="w-full h-full bg-linear-to-t from-[#050505] to-[#252525] rounded-3xl flex flex-col md:flex-row p-3">
          {/* IZQUIERDA */}
          <LoginImageCard />

          {/* DERECHA */}
          <LoginForm
            group={group}
            setGroup={setGroup}
            language={language}
            setLanguage={setLanguage}
            isGroupOpen={isGroupOpen}
            setIsGroupOpen={setIsGroupOpen}
            isLangOpen={isLangOpen}
            setIsLangOpen={setIsLangOpen}
            // 👇 4. PASAMOS LA DATA AL HIJO
            poolOptions={poolOptions}
            isLoadingPools={isLoadingPools}
          />
        </div>
      </div>
    </div>
  );
};
