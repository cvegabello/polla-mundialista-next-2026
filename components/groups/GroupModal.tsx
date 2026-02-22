"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom"; // 👈 NUEVO: Teletransportador de React
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { MatchReal, TableStats, GroupDataReal } from "@/types";
import { calculateStandings } from "@/utils/standings";
import { X, Save, XCircle, Loader2 } from "lucide-react";

interface GroupModalProps {
  group: GroupDataReal;
  currentMatches: MatchReal[];
  lang: Language;
  onClose: () => void;
  onSave: (newMatches: MatchReal[], newTable: TableStats[]) => Promise<void>;
  isLocked?: boolean;
}

export const GroupModal = ({
  group,
  currentMatches,
  lang,
  onClose,
  onSave,
  isLocked,
}: GroupModalProps) => {
  const t = DICTIONARY[lang];

  const [localMatches, setLocalMatches] = useState<MatchReal[]>(currentMatches);
  const [localTable, setLocalTable] = useState<TableStats[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false); // 👈 Control para el Portal

  useEffect(() => {
    setMounted(true); // Evita errores de hidratación en Next.js
    setLocalTable(calculateStandings(localMatches, lang));
  }, []);

  const handleLocalScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);
    const updatedMatches = localMatches.map((m) => {
      if (m.id === matchId) {
        return type === "home"
          ? { ...m, home_score: newVal }
          : { ...m, away_score: newVal };
      }
      return m;
    });

    setLocalMatches(updatedMatches);
    setLocalTable(calculateStandings(updatedMatches, lang));
  };

  // 🔥 ESTA ES LA FUNCIÓN QUE CORRIGE EL ERROR DE LA IMAGEN
  const handleManualTableSort = (updatedTable: TableStats[]) => {
    setLocalTable(updatedTable);
  };

  const hasChanges = useMemo(() => {
    return localMatches.some((localMatch) => {
      const originalMatch = currentMatches.find((m) => m.id === localMatch.id);

      // Convertimos todo a string para comparar "nada" con "nada"
      const normalize = (val: any) =>
        val === null || val === undefined || val === "" ? "" : val.toString();

      const lh = normalize(localMatch.home_score);
      const la = normalize(localMatch.away_score);
      const oh = normalize(originalMatch?.home_score);
      const oa = normalize(originalMatch?.away_score);

      return lh !== oh || la !== oa;
    });
  }, [localMatches, currentMatches]);

  const handleSaveClick = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      // Enviamos los datos normalizados para que la DB y el estado local coincidan
      const sanitizedMatches = localMatches.map((m) => ({
        ...m,
        home_score:
          m.home_score === null || m.home_score === undefined
            ? null
            : Number(m.home_score),
        away_score:
          m.away_score === null || m.away_score === undefined
            ? null
            : Number(m.away_score),
      }));

      await onSave(sanitizedMatches, localTable);

      // 🚀 IMPORTANTE: Cerramos el modal solo después de que el estado
      // de la tarjeta principal se haya actualizado.
      onClose();
    } catch (error) {
      console.error("Error al salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 📦 Todo el contenido del Modal guardado en una variable
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-slate-800/80">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wider">
            {lang === "en" ? "Group" : "Grupo"}{" "}
            {group.name.replace("Grupo ", "").replace("Group ", "")}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer hover:rotate-90 duration-300"
          >
            <X size={28} />
          </button>
        </div>

        {/* CUERPO */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {localMatches.map((match) => (
              <div
                key={match.id}
                className="bg-slate-800/40 p-3 rounded-xl border border-white/5 shadow-inner"
              >
                <MatchRow
                  match={match}
                  editable={!isLocked && !isSaving}
                  onScoreChange={handleLocalScoreChange}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          {/* TABLA: Ahora le pasamos variant="large" */}
          <GroupTable
            tableData={localTable}
            lang={lang}
            variant="large"
            onTableChange={handleManualTableSort}
          />
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/10 bg-slate-800/90 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-gray-300 bg-slate-700 hover:bg-slate-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <XCircle size={18} />
            {lang === "en" ? "Cancel" : "Cancelar"}
          </button>

          <button
            onClick={handleSaveClick}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${
              !hasChanges
                ? "bg-slate-600 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/40 hover:scale-105 cursor-pointer"
            }`}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving
              ? lang === "en"
                ? "Applying..."
                : "Aplicando..."
              : lang === "en"
                ? "Apply Changes"
                : "Aplicar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );

  // 🚀 LA MAGIA DEL PORTAL: Si ya cargó, lo teletransporta al body. Si no, no renderiza nada.
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
};
