"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  R32_MATCHUPS,
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";
import { Language, DICTIONARY } from "@/components/constants/dictionary";
import { CustomSVGMatchCard } from "@/components/bracket/CustomSVGMatchCard";

// Dynamic import for the bracket library to avoid SSR issues
const SingleEliminationBracket = dynamic<any>(
  () => import("@g-loot/react-tournament-brackets").then((mod) => mod.SingleEliminationBracket),
  { ssr: false }
);

import { OfficialKnockoutResults } from "./OfficialKnockoutResults";

const SVGViewer = dynamic<any>(
  () => import("@g-loot/react-tournament-brackets").then((mod) => mod.SVGViewer),
  { ssr: false }
);

const Match = dynamic<any>(
  () => import("@g-loot/react-tournament-brackets").then((mod) => mod.Match),
  { ssr: false }
);


interface OfficialKnockoutResultsV2Props {
  groupsData: any[];
  officialWinners: Record<string, any>;
  officialScores: any[];
  lang: Language;
}

export const OfficialKnockoutResultsV2 = ({
  groupsData,
  officialWinners,
  officialScores,
  lang,
}: OfficialKnockoutResultsV2Props) => {
  const t = DICTIONARY[lang];
  const [dimensions, setDimensions] = React.useState({ width: 1200, height: 800 });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight * 0.75,
      });

      const handleResize = () => {
        setDimensions((prev) => {
          // Ignore vertical resize to prevent mobile URL bar from resetting the zoom/pan state
          if (prev.width === window.innerWidth) return prev;
          return {
            width: window.innerWidth,
            height: window.innerHeight * 0.75,
          };
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const bracketSvgWrapper = React.useCallback(
    (wrapperProps: any) => {
      const { children, bracketWidth, bracketHeight } = wrapperProps;
      
      // En móviles (pantallas pequeñas), usamos scroll nativo para evitar el famoso bug de iOS Safari 
      // donde foreignObject se rompe y desproporciona completamente al aplicar transformaciones de escala.
      if (dimensions.width < 768) {
        return (
          <div 
            className="w-full h-full overflow-auto"
            style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
          >
            <svg 
              width={bracketWidth} 
              height={bracketHeight}
              viewBox={`0 0 ${bracketWidth} ${bracketHeight}`}
              style={{ minWidth: bracketWidth, minHeight: bracketHeight }}
            >
              {children}
            </svg>
          </div>
        );
      }

      // En PC, usamos SVGViewer para tener la manito de arrastre
      return (
        <SVGViewer
          width={dimensions.width}
          height={dimensions.height}
          background="transparent"
          SVGBackground="transparent"
          {...wrapperProps}
        >
          {children}
        </SVGViewer>
      );
    },
    [dimensions.width, dimensions.height]
  );

  // Map to find the group letter of any team
  const teamGroupMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (groupsData) {
      groupsData.forEach((g) => {
        if (g.id === "FI") return;
        const letter = g.name.replace(/Grupo /i, "").replace(/Group /i, "").trim();
        g.matches?.forEach((m: any) => {
          if (m.home_team_id) map[m.home_team_id] = letter;
          if (m.away_team_id) map[m.away_team_id] = letter;
        });
      });
    }
    return map;
  }, [groupsData]);

  // Transform our flat arrays into the format required by the library
  const { mainBracketMatches, thirdPlaceMatch } = useMemo(() => {
    const getNextMatchId = (matchId: string) => {
      const wId = `W${matchId}`;
      const findIn = (arr: any[]) => arr.find((m) => m.h === wId || m.a === wId);
      const next = findIn(R16_MATCHUPS) || findIn(QF_MATCHUPS) || findIn(SF_MATCHUPS) || findIn(F_MATCHUPS);
      return next ? next.id : null;
    };

    const allFlatMatchups = [
      ...R32_MATCHUPS.map((m) => ({ ...m, round: t.bracketPhaseR32Full })),
      ...R16_MATCHUPS.map((m) => ({ ...m, round: t.bracketPhaseR16Full })),
      ...QF_MATCHUPS.map((m) => ({ ...m, round: t.bracketPhaseQFFull })),
      ...SF_MATCHUPS.map((m) => ({ ...m, round: t.bracketPhaseSFFull })),
      ...F_MATCHUPS.filter((m) => m.id === "104").map((m) => ({ ...m, round: t.bracketPhaseFTitle, isFinal: true })),
    ];

    const mapMatch = (m: any) => {
      const officialMatchData = officialScores.find(
        (om) => om.match_number?.toString() === m.id.toString() || om.id?.toString() === m.id.toString()
      );

      const dbHome = officialMatchData?.home_team || {};
      const dbAway = officialMatchData?.away_team || {};

      const homeName = dbHome.name_es ? (lang === "en" ? dbHome.name_en || dbHome.name_es : dbHome.name_es) : m.h;
      const awayName = dbAway.name_es ? (lang === "en" ? dbAway.name_en || dbAway.name_es : dbAway.name_es) : m.a;

      return {
        id: m.id,
        nextMatchId: getNextMatchId(m.id),
        tournamentRoundText: m.round,
        startTime: m.info,
        state: officialMatchData ? "DONE" : "SCHEDULED",
        matchCode: m.id,
        lang,
        isFinal: m.isFinal,
        participants: [
          {
            id: m.h, // Unique ID within the match
            teamId: officialMatchData?.home_team_id || null, // Real DB UUID
            resultText: officialMatchData?.home_score?.toString() || null,
            isWinner: officialMatchData?.winner_id === officialMatchData?.home_team_id,
            status: null,
            name: homeName,
            seed: m.h,
            group: officialMatchData?.home_team_id ? teamGroupMap[officialMatchData.home_team_id] : null,
            picture: dbHome.flag_code || dbHome.flag || null,
          },
          {
            id: m.a,
            teamId: officialMatchData?.away_team_id || null,
            resultText: officialMatchData?.away_score?.toString() || null,
            isWinner: officialMatchData?.winner_id === officialMatchData?.away_team_id,
            status: null,
            name: awayName,
            seed: m.a,
            group: officialMatchData?.away_team_id ? teamGroupMap[officialMatchData.away_team_id] : null,
            picture: dbAway.flag_code || dbAway.flag || null,
          },
        ],
      };
    };

    const mappedMain = allFlatMatchups.map(mapMatch);
    
    const thirdPlaceRaw = F_MATCHUPS.find((m) => m.id === "103");
    const thirdPlaceMapped = thirdPlaceRaw ? mapMatch({ ...thirdPlaceRaw, round: lang === "en" ? "Third Place" : "Tercer Puesto", isFinal: false }) : null;

    return { mainBracketMatches: mappedMain, thirdPlaceMatch: thirdPlaceMapped };
  }, [officialScores, lang, t, teamGroupMap]);

  const isMobileOrTablet = dimensions.width < 1024;

  if (isMobileOrTablet) {
    return (
      <OfficialKnockoutResults
        groupsData={groupsData}
        officialWinners={officialWinners}
        officialScores={officialScores}
        lang={lang}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center py-6 bg-transparent gap-8">
      {/* BRACKET PRINCIPAL */}
      <div className="w-full max-w-[100vw] overflow-hidden bg-[#050508]/80 border border-white/5 rounded-3xl shadow-2xl relative" style={{ height: "75vh" }}>
        {mainBracketMatches.length > 0 && (
          <SingleEliminationBracket
            matches={mainBracketMatches}
            matchComponent={CustomSVGMatchCard}
            options={{
              style: {
                connectorColor: "#f97316", // orange-500
                connectorColorHighlight: "#fb923c", // orange-400
                boxHeight: 125,
                width: 250,
              }
            }}
            svgWrapper={bracketSvgWrapper}
          />
        )}
      </div>

      {/* Tercer Puesto (Aislado) */}
      {thirdPlaceMatch && (
        <div className="w-full max-w-md flex flex-col items-center gap-4 bg-black/40 p-8 rounded-3xl border border-orange-500/20">
          <h3 className="text-orange-400 font-bold uppercase tracking-widest text-sm">
            {lang === "en" ? "Third Place Match" : "Partido por el Tercer Puesto"}
          </h3>
          <svg width={250} height={125} className="overflow-visible">
            <foreignObject width={250} height={125} x={0} y={0}>
              <CustomSVGMatchCard match={thirdPlaceMatch} />
            </foreignObject>
          </svg>
        </div>
      )}
    </div>
  );
};


