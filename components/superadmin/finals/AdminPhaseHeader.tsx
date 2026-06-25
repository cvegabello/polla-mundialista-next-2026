import React from "react";
import { ShieldCheck } from "lucide-react";

interface AdminPhaseHeaderProps {
  title: string;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const AdminPhaseHeader = ({ title, onSync, isSyncing }: AdminPhaseHeaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-red-950/40 border border-red-500/30 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(220,38,38,0.15)] w-full transition-all duration-300 relative group">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-red-500" />
        <span className="text-sm font-black uppercase tracking-[0.15em] text-red-400 text-center drop-shadow-md">
          {title}
        </span>
      </div>
      
      {onSync && (
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="absolute right-3 p-1.5 bg-red-900/50 hover:bg-red-800 rounded-md text-red-300 hover:text-white transition-colors disabled:opacity-50"
          title="Sincronizar Llaves a Fans"
        >
          <svg className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
};
