"use client";

import React from "react";
import { GroupCard } from "@/components/groups/GroupCard"; // Ajuste la ruta si es necesario
import { GroupDataReal } from "@/types";
import { Language } from "@/components/constants/dictionary";

interface OfficialGroupsResultsProps {
  groupsData: GroupDataReal[];
  lang: Language;
}

export const OfficialGroupsResults = ({
  groupsData,
  lang,
}: OfficialGroupsResultsProps) => {
  // Filtramos el grupo FI (Finales) por si viene en la data
  const validGroups = groupsData.filter((g) => g.id !== "FI");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center animate-in fade-in duration-500 pt-4">
      {validGroups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          lang={lang}
          isLocked={true} // 👈 MAGIA 1: Apaga los inputs y prende los div de texto
          initialPredictions={[]} // 👈 MAGIA 2: Al estar vacío, obliga al componente a leer de la DB (match.home_score)
          onPredictionChange={() => {}} // Función vacía, aquí no hay botones de guardar
        />
      ))}
    </div>
  );
};
