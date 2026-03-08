import React from "react";

interface AdminBracketMatchRowProps {
  seed: string;
  teamName: string | React.ReactNode;
  score: string;
  isWinner: boolean;
  seedColor?: string;
  isTie?: boolean;
  onScoreChange: (val: string) => void;
  onWinnerChange: () => void;
}

export const AdminBracketMatchRow: React.FC<AdminBracketMatchRowProps> = ({
  seed,
  teamName,
  score,
  isWinner,
  seedColor = "text-red-500", // 👈 Por defecto, rojo Admin
  isTie = false,
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
        document.querySelectorAll(".admin-score-input"),
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
        <span className="text-[13px] font-bold text-gray-200 truncate uppercase tracking-tight">
          {teamName || "---"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isWinner}
          onChange={onWinnerChange}
          className={`w-4 h-4 rounded border-red-900/50 bg-black checked:bg-orange-500 transition-all cursor-pointer ${
            isTie ? "visible" : "invisible pointer-events-none"
          }`}
        />

        {/* INPUT ESTILO ADMIN (Rojo y negro) */}
        <input
          type="number"
          enterKeyHint="next"
          value={score}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="-"
          className="admin-score-input w-9 h-7 bg-red-100 text-red-950 text-center font-black rounded-md border border-red-500 shadow-inner focus:ring-2 focus:ring-red-700 outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
};
