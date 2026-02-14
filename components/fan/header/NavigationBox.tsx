import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { User, Trophy } from "lucide-react";
import { SelectionBox } from "./SelectionBox"; // 👇 Importamos la nueva joya

interface NavigationBoxProps {
  lang: Language;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const NavigationBox = ({
  lang,
  currentView,
  onViewChange,
}: NavigationBoxProps) => {
  const t = DICTIONARY[lang];

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-4xl mx-auto mb-4 relative z-20">
      {/* 🟦 CAJA 1: MIS PRONÓSTICOS (Variant Blue) */}
      <SelectionBox
        title={t.myPredictions}
        icon={<User size={16} />}
        variant="blue"
        currentValue={currentView}
        onOptionSelect={onViewChange}
        options={[
          { label: t.btnGroups, value: "pred_groups" },
          { label: t.btnFinals, value: "pred_finals" },
        ]}
      />

      {/* 🏆 CAJA 2: RESULTADOS FIFA (Variant Gold) */}
      <SelectionBox
        title={t.officialResults}
        icon={<Trophy size={16} />}
        variant="gold"
        currentValue={currentView}
        onOptionSelect={onViewChange}
        options={[
          // Aquí personalizamos los labels como queríamos ("Ver Grupos" / "Ver Finales")
          {
            label: lang === "es" ? "Ver Grupos" : "View Groups",
            value: "res_groups",
          },
          {
            label: lang === "es" ? "Ver Finales" : "View Finals",
            value: "res_finals",
          },
        ]}
      />
    </div>
  );
};
