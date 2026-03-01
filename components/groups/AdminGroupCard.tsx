"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminMatchRow } from "./AdminMatchRow";
import { GroupTable } from "@/components/groups/GroupTable"; // Reutilizamos la tabla original, esa sí nos sirve igualita
import { GroupDataReal } from "@/types";
import { calculateStandings } from "@/utils/standings";
import { saveOfficialScoreAction } from "@/lib/actions/super-admin-actions";
import { Save, Loader2, AlertCircle } from "lucide-react";

interface AdminGroupCardProps {
  group: GroupDataReal;
  lang?: "es" | "en";
}

export const AdminGroupCard = ({ group, lang = "es" }: AdminGroupCardProps) => {
  // Estado local para los partidos de este grupo
  const [localMatches, setLocalMatches] = useState(group.matches || []);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Cada vez que cambien los marcadores, recalculamos la tabla en vivo
  useEffect(() => {
    setTableData(calculateStandings(localMatches, lang));
  }, [localMatches, lang]);

  const handleScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);
    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, [type === "home" ? "home_score" : "away_score"]: newVal }
          : m,
      ),
    );
    setMessage({ text: "", type: "" }); // Limpiamos mensajes al editar
  };

  // Verificamos si hay cambios reales respecto a la base de datos
  const hasChanges = useMemo(() => {
    return localMatches.some((lm) => {
      const om = group.matches.find((m: any) => m.id === lm.id);
      return (
        lm.home_score !== om?.home_score || lm.away_score !== om?.away_score
      );
    });
  }, [localMatches, group.matches]);

  const handleSaveOfficial = async () => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      // Filtramos solo los partidos que tienen marcadores completos para guardar
      const matchesToSave = localMatches.filter(
        (m) => m.home_score !== null && m.away_score !== null,
      );

      for (const match of matchesToSave) {
        // Calculamos quién ganó (para actualizar la columna winner_id de la tabla matches)
        let winnerId = null;
        if (match.home_score! > match.away_score!)
          winnerId = match.home_team_id;
        else if (match.away_score! > match.home_score!)
          winnerId = match.away_team_id;

        await saveOfficialScoreAction(
          match.id,
          match.home_score!,
          match.away_score!,
          winnerId,
        );
      }

      setMessage({ text: "¡Resultados Oficiales Guardados!", type: "success" });
    } catch (error) {
      console.error("Error guardando:", error);
      setMessage({
        text: "Error al guardar. Revise la consola.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  return (
    <div className="relative group w-full max-w-[350px] mx-auto transform-gpu">
      <div className="relative bg-black border-2 border-red-900/50 rounded-xl flex flex-col overflow-hidden shadow-2xl shadow-red-900/20 z-10">
        {/* Rayita superior de peligro/admin */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-orange-500"></div>

        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-900/30">
            <h3 className="text-xl font-bold text-red-500">
              GRUPO {group.name.replace("Grupo ", "").replace("Group ", "")}
            </h3>
            {hasChanges && (
              <AlertCircle
                size={18}
                className="text-orange-500 animate-pulse"
              />
            )}
          </div>

          <div className="space-y-1 mb-4">
            {localMatches.map((match) => (
              <AdminMatchRow
                key={match.id}
                match={match}
                lang={lang}
                onScoreChange={handleScoreChange}
              />
            ))}
          </div>

          {/* Tabla de posiciones real en base a los marcadores de arriba */}
          <GroupTable tableData={tableData} lang={lang} />

          {/* BOTÓN DE GUARDADO OFICIAL */}
          <button
            onClick={handleSaveOfficial}
            disabled={!hasChanges || isSaving}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
              !hasChanges
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/50 cursor-pointer"
            }`}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Guardando en DB..." : "Guardar Oficiales"}
          </button>

          {/* Mensaje de feedback */}
          {message.text && (
            <p
              className={`text-center text-xs mt-2 font-bold ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
