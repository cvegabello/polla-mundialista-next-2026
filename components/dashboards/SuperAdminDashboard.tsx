"use client";

import React, { useState, useEffect } from "react";
import { AdminGroupCard } from "@/components/groups/AdminGroupCard";
import { SuperAdminHeader } from "@/components/admin/header/SuperAdminHeader"; // 👈 IMPORTAMOS
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface SuperAdminDashboardProps {
  groupsData: any[];
  lang: Language;
}

export const SuperAdminDashboard = ({
  groupsData,
  lang = "es",
}: SuperAdminDashboardProps) => {
  const t = DICTIONARY[lang];
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <main className="min-h-screen bg-black"></main>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* NUEVO ENCABEZADO PRO 👑 */}
      <SuperAdminHeader lang={lang} />

      {/* GRILLA DE GRUPOS */}
      <div className="max-w-[1500] mx-auto p-4 md:p-6">
        <div className="flex items-center gap-3 mb-8 border-l-4 border-red-600 pl-4">
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-200">
            {t.btnGroups} <span className="text-red-500">|</span>{" "}
            {lang === "en" ? "Official Results" : "Resultados Oficiales"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 max-w-[1600px] mx-auto justify-items-center">
          {groupsData
            .filter((group) => group.id !== "FI")
            .map((group) => (
              <AdminGroupCard key={group.id} group={group} lang={lang} />
            ))}
        </div>
      </div>
    </main>
  );
};
