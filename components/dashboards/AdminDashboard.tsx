"use client";

import React from "react";
import { GroupCard } from "@/components/groups/GroupCard";

interface AdminDashboardProps {
  groupsData: any[];
  onLogout: () => void;
}

export const AdminDashboard = ({
  groupsData,
  onLogout,
}: AdminDashboardProps) => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] p-8">
      <div className="flex justify-between text-white mb-8">
        <h1 className="text-2xl font-bold text-yellow-500">Zona Admin</h1>
        <button
          onClick={onLogout}
          className="text-red-400 border border-red-500 px-4 rounded"
        >
          Salir
        </button>
      </div>

      {/* El Admin ve las tarjetas, pero GroupCard internamente mostrará "Vista de Admin" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupsData?.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            initialPredictions={[]} // El admin no predice aquí
          />
        ))}
      </div>
    </div>
  );
};
