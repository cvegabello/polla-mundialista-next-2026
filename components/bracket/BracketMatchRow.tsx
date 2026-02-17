import React from "react";

interface BracketMatchRowProps {
  seed: string;
  teamName: string;
  score: string;
  isWinner: boolean;
  seedColor?: string;
  onScoreChange: (val: string) => void;
  onWinnerChange: () => void;
}

export const BracketMatchRow: React.FC<BracketMatchRowProps> = ({
  seed,
  teamName,
  score,
  isWinner,
  seedColor = "text-amber-400",
  onScoreChange,
  onWinnerChange,
}) => {
  // Función de validación interna: Solo números y máximo 2 dígitos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Regla: Solo dígitos (\d*) y máximo 2 caracteres
    if (/^\d*$/.test(value) && value.length <= 2) {
      onScoreChange(value);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 w-full py-0.5 min-h-[36px]">
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
          checked={isWinner}
          onChange={onWinnerChange}
          className="w-4 h-4 rounded border-white/20 bg-slate-800 checked:bg-cyan-500 transition-all cursor-pointer"
        />

        {/* INPUT BLINDADO */}
        <input
          type="text"
          inputMode="numeric" // Optimiza el teclado en celulares
          value={score}
          onChange={handleChange}
          placeholder="0"
          className="w-[42px] h-8 bg-white text-black text-center font-black rounded-md border-none shadow-inner focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
};
