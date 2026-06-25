import React from "react";
import { BracketMatchCard } from "./BracketMatchCard";

export const CustomSVGMatchCard = ({ match, ...props }: any) => {
  // Extract data from the library's format back to our format
  const topParty = match.participants[0];
  const bottomParty = match.participants[1];

  const homeTeam = {
    id: topParty?.teamId,
    seed: topParty?.seed,
    group: topParty?.group,
    name: topParty?.name,
    flag: topParty?.picture,
  };

  const awayTeam = {
    id: bottomParty?.teamId,
    seed: bottomParty?.seed,
    group: bottomParty?.group,
    name: bottomParty?.name,
    flag: bottomParty?.picture,
  };

  const simulatedPrediction = match.state === "DONE" || match.state === "SCORE_DONE"
    ? {
        pred_home: topParty.resultText ? parseInt(topParty.resultText) : 0,
        pred_away: bottomParty.resultText ? parseInt(bottomParty.resultText) : 0,
        predicted_winner: topParty.isWinner ? topParty.teamId : bottomParty.isWinner ? bottomParty.teamId : null,
      }
    : undefined;

  // Render our existing HTML BracketMatchCard
  return (
    <div style={{ width: 250, height: 125 }} className="flex items-center justify-center pointer-events-auto overflow-visible relative">
      <BracketMatchCard
        matchId={match.matchCode}
        matchCode={`M${match.matchCode}`}
        lang={match.lang || "es"}
        isFinal={match.isFinal}
        isLocked={true}
        style={{ margin: 0, padding: 0 }} // Reset margins because SVG lines handle spacing
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        prediction={simulatedPrediction}
        hideOfficialAndPoints={true}
      />
    </div>
  );
};
