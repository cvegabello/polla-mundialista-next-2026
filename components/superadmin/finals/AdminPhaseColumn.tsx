import React from "react";
import { AdminPhaseHeader } from "./AdminPhaseHeader";

interface AdminPhaseColumnProps {
  title: string;
  children?: React.ReactNode;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const AdminPhaseColumn: React.FC<AdminPhaseColumnProps> = ({
  title,
  children,
  onSync,
  isSyncing,
}) => {
  return (
    // 'h-full' asegura que todas las columnas midan exactamente lo mismo
    <div className="flex flex-col w-[280px] shrink-0 relative h-full">
      <div className="bg-transparent pt-6 pb-6 mb-2">
        <AdminPhaseHeader title={title} onSync={onSync} isSyncing={isSyncing} />
      </div>

      <div className="flex flex-col gap-4 pb-12">{children}</div>
    </div>
  );
};
