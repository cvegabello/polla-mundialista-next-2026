"use client";

import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFullGroupsData } from "@/services/groupService";

export default function AdminPage() {
  const [groupsData, setGroupsData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Aquí podrías validar si es admin, si no, lo mandas pa' la casa
    const loadAdminData = async () => {
      const data = await getFullGroupsData();
      setGroupsData(data);
    };
    loadAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("polla_session");
    router.push("/login");
  };

  return <AdminDashboard groupsData={groupsData} onLogout={handleLogout} />;
}
