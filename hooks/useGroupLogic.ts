import { useState, useEffect, useRef } from "react";
import { GroupDataReal, MatchReal, TableStats } from "@/types";
import { calculateStandings } from "@/utils/standings";

export const useGroupLogic = (
  group: GroupDataReal,
  lang: string,
  initialPredictions: any[],
  onGroupDirty?: (groupId: string, matches: any[], tableData: any[]) => void,
) => {
  const [matches, setMatches] = useState<MatchReal[]>(() => {
    return group.matches.map((match) => {
      const pred = initialPredictions.find((p) => p.match_id === match.id);
      return pred
        ? { ...match, home_score: pred.pred_home, away_score: pred.pred_away }
        : match;
    });
  });

  const [tableData, setTableData] = useState<TableStats[]>([]);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem("polla_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setUserRole(session.role);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (
      isReady &&
      !hasInitializedRef.current &&
      initialPredictions.length > 0
    ) {
      setMatches((prev) =>
        prev.map((m) => {
          const pred = initialPredictions.find((p) => p.match_id === m.id);
          return pred
            ? { ...m, home_score: pred.pred_home, away_score: pred.pred_away }
            : m;
        }),
      );
      hasInitializedRef.current = true;
    }
  }, [initialPredictions, isReady]);

  // Calculamos la tabla al inicio
  useEffect(() => {
    setTableData(calculateStandings(matches, lang));
  }, [matches, lang]);

  const handleScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId)
        return type === "home"
          ? { ...m, home_score: newVal }
          : { ...m, away_score: newVal };
      return m;
    });
    setMatches(updatedMatches);

    const newTable = calculateStandings(updatedMatches, lang);
    setTableData(newTable);

    // 🚨 Solo avisamos al Header que hay cambios, NO guardamos en BD
    if (onGroupDirty) {
      onGroupDirty(group.id, updatedMatches, newTable);
    }
  };

  const handleManualSort = async (updatedTable: TableStats[]) => {
    setTableData(updatedTable);
    // 🚨 Solo avisamos al Header que hay cambios, NO guardamos en BD
    if (onGroupDirty) {
      onGroupDirty(group.id, matches, updatedTable);
    }
  };

  const handleBulkUpdate = (
    newMatches: MatchReal[],
    newTable: TableStats[],
  ) => {
    setMatches(newMatches);
    setTableData(newTable);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return {
    matches,
    tableData,
    saveStatus,
    userRole,
    isReady,
    handleScoreChange,
    handleManualSort,
    handleBulkUpdate,
  };
};
