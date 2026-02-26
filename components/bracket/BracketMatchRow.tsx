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

  // 🪄 MAGIA 1: Detectar la tecla "Enter" para saltar a la siguiente cajita
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evitamos que haga saltos de línea raros

      // Buscamos todas las cajitas de marcador en la pantalla usando la clase 'score-input'
      const inputs = Array.from(
        document.querySelectorAll(".score-input"),
      ) as HTMLInputElement[];

      // Encontramos en cuál estamos parados ahora mismo
      const currentIndex = inputs.indexOf(e.currentTarget);

      // Si hay una siguiente cajita, ¡pum! le pasamos el foco
      if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      }
    }
  };

  // 🪄 MAGIA 2: Seleccionar (subrayar) todo el texto apenas entra a la cajita
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
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
          disabled={isLocked}
          checked={isWinner}
          onChange={onWinnerChange}
          className={`w-4 h-4 rounded border-white/20 bg-slate-800 checked:bg-cyan-500 transition-all cursor-pointer ${
            isTie ? "visible" : "invisible pointer-events-none"
          }`}
        />

        {/* INPUT REPOTENCIADO */}
        <input
          type="number"
          disabled={isLocked}
          enterKeyHint="next" // 👈 ¡EL TRUCO! Esto pone la flechita "Siguiente" en el teclado del celular
          value={score}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="-"
          className="score-input w-[42px] h-8 bg-white text-black text-center font-black rounded-md border-none shadow-inner focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
};
