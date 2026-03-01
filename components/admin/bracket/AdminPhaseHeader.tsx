import React from "react";
import { ShieldCheck } from "lucide-react";

interface AdminPhaseHeaderProps {
  title: string;
}

export const AdminPhaseHeader = ({ title }: AdminPhaseHeaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-red-950/40 border border-red-500/30 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(220,38,38,0.15)] w-full transition-all duration-300">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-red-500" />
        <span className="text-sm font-black uppercase tracking-[0.15em] text-red-400 text-center drop-shadow-md">
          {title}
        </span>
      </div>
    </div>
  );
};
