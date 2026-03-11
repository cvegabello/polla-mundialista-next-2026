import React from "react";

interface BracketMatchRowProps {
  seed: string;
  teamName: string;
  score: string;
  isWinner: boolean;
  seedColor?: string;
  isTie?: boolean;
  isLocked?: boolean;
  onScoreChange: (val: string) => void;
  onWinnerChange: () => void;
}

export const BracketMatchRow: React.FC<BracketMatchRowProps> = ({
  seed,
  teamName,
  score,
  isWinner,
  seedColor = "text-amber-400",
  isTie = false,
  isLocked,
  onScoreChange,
  onWinnerChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 2) {
      onScoreChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const inputs = Array.from(
        document.querySelectorAll(".score-input"),
      ) as HTMLInputElement[];

      const currentIndex = inputs.indexOf(e.currentTarget);

      if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full py-0 min-h-[28px]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span
          className={`text-xs font-black w-7 ${seedColor} drop-shadow-md text-right`}
        >
          {seed}
        </span>
        <span className="text-[13px] font-bold text-white/90 truncate uppercase tracking-tight">
          {teamName || "---"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={isLocked}
          checked={isWinner}
          onChange={onWinnerChange}
          className={`w-4 h-4 rounded border-white/20 bg-slate-800 checked:bg-cyan-500 transition-all cursor-pointer ${
            isTie ? "visible" : "invisible pointer-events-none"
          }`}
        />

        {/* INPUT REPOTENCIADO - CON BORDE VISIBLE 📦 */}
        <input
          type="number"
          disabled={isLocked}
          enterKeyHint="next"
          value={score}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="-"
          className={`score-input w-9 h-7 text-center font-black rounded-md shadow-inner outline-none transition-all text-sm ${
            isLocked
              ? "bg-[#1e293b] border border-[#475569] cursor-not-allowed opacity-100" // 👈 AQUÍ LE PUSE EL BORDE
              : "bg-white text-black border-none focus:ring-2 focus:ring-cyan-500"
          }`}
          style={{
            opacity: 1,
            WebkitOpacity: 1,
            WebkitTextFillColor: isLocked ? "#ffffff" : "#000000",
            color: isLocked ? "#ffffff" : "#000000",
          }}
        />
      </div>
    </div>
  );
};
