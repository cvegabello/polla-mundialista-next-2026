"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getSystemUsersAction,
  revertUserToDraftAction,
} from "@/lib/actions/super-admin-actions";
import { Filter } from "lucide-react"; // 👈 Icono para nuestro CustomSelect

// ⚠️ IMPORTANTE MI DT: Ajuste estas dos rutas según donde tenga guardados sus archivos
import { CustomSelect } from "@/components/ui/CustomSelect"; // <- Ajuste la ruta
import { getActivePollas } from "@/services/pollaService"; // <- Ajuste la ruta

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal = ({
  isOpen,
  onClose,
}: UserManagementModalProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 🚀 Estados para el CustomSelect de Pollas
  const [pollasOptions, setPollasOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedPolla, setSelectedPolla] = useState<string>("TODAS");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoading(true);

    // 1. Traemos las pollas usando su servicio ya creado
    try {
      const pollas = await getActivePollas(true);
      setPollasOptions([
        { value: "TODAS", label: "🌍 Todas las Pollas" },
        ...pollas,
      ]);
    } catch (error) {
      console.error("Error cargando pollas:", error);
    }

    // 2. Traemos los usuarios
    const res = await getSystemUsersAction();
    if (res.success && res.data) {
      setUsers(res.data);
    }

    setIsLoading(false);
  };

  const handleOpenLock = async (userId: string, username: string) => {
    const confirm = window.confirm(
      `¿Seguro que desea devolver a "${username}" a estado BORRADOR?`,
    );
    if (!confirm) return;

    setProcessingId(userId);
    const res = await revertUserToDraftAction(userId);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, sub_date_groups: null } : u,
        ),
      );
    } else {
      alert("❌ Hubo un error al intentar abrir el candado.");
    }
    setProcessingId(null);
  };

  // 🧠 3. Filtrar y Ordenar a los jugadores (CON EL VAR ENCENDIDO 🕵️‍♂️)
  const displayedUsers = useMemo(() => {
    console.log("=== 🕵️‍♂️ VAR: INICIANDO FILTRO DE USUARIOS ===");
    console.log(
      "1️⃣ Valor de 'selectedPolla' (Lo que usted seleccionó):",
      selectedPolla,
    );

    if (users.length > 0) {
      console.log(
        "2️⃣ Muestra de los primeros 3 usuarios que llegan de la BD:",
        users
          .slice(0, 3)
          .map((u) => ({ username: u.username, polla_id: u.polla_id })),
      );
    }

    console.log("3️⃣ Opciones del Combobox (pollasOptions):", pollasOptions);

    let result = users;

    // A. Filtro por Polla
    if (selectedPolla !== "TODAS") {
      result = result.filter((u) => {
        const checkID = String(u.polla_id) === String(selectedPolla);

        // Buscamos el nombre por si acaso
        const pollaSeleccionada = pollasOptions.find(
          (p) => String(p.value) === String(selectedPolla),
        );
        const checkName =
          String(u.polla_id) === String(pollaSeleccionada?.label);

        if (checkID || checkName) {
          console.log(
            `✅ Usuario ${u.username} PASA el filtro (Coincide con la polla)`,
          );
        }

        return checkID || checkName;
      });

      console.log(
        `📊 Resultado después de filtrar: Quedaron ${result.length} usuarios`,
      );
    }

    // B. Ordenar: ENVIADOS primero (arriba), BORRADOR después (abajo)
    return [...result].sort((a, b) => {
      const aEnviado = !!a.sub_date_groups;
      const bEnviado = !!b.sub_date_groups;

      if (aEnviado && !bEnviado) return -1;
      if (!aEnviado && bEnviado) return 1;

      return (a.username || "").localeCompare(b.username || "");
    });
  }, [users, selectedPolla, pollasOptions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-visible relative flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center relative bg-[#0a0a0a] rounded-t-xl z-30">
          <h2 className="text-2xl font-black text-amber-400 w-full text-center tracking-wide">
            👮‍♂️ GESTIÓN DE USUARIOS
          </h2>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-500 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 🚀 NUEVO: FILTRO POR POLLA CON SU CUSTOM SELECT */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between z-20">
          <div className="w-64">
            <CustomSelect
              icon={Filter}
              value={selectedPolla}
              onChange={setSelectedPolla}
              options={pollasOptions}
              placeholder="Seleccione una polla..."
              isOpen={isSelectOpen}
              setIsOpen={setIsSelectOpen}
            />
          </div>
          <span className="text-gray-500 text-xs font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800">
            Mostrando {displayedUsers.length} usuarios
          </span>
        </div>

        {/* TITULOS DE COLUMNAS */}
        <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-gray-800 text-cyan-400 font-bold text-sm text-center bg-[#111] z-10">
          <div className="text-left">Usuario</div>
          <div>Fase Grupos</div>
          <div>Acción</div>
        </div>

        {/* LISTA DE USUARIOS */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 min-h-[300px] z-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40 text-gray-500 font-bold animate-pulse">
              Cargando usuarios...
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-gray-500 font-medium">
              No se encontraron usuarios para esta polla.
            </div>
          ) : (
            displayedUsers.map((user) => {
              const isSubmitted = !!user.sub_date_groups;
              // Buscamos el nombre de la polla para mostrarlo en pequeñito si estamos en "TODAS"
              // Buscamos el nombre de la polla (Blindado por si u.polla_id es número o nombre)
              const pollaObj = pollasOptions.find(
                (p) =>
                  String(p.value) === String(user.polla_id) ||
                  String(p.label) === String(user.polla_id),
              );
              const pollaName = pollaObj?.label;

              return (
                <div
                  key={user.id}
                  className="grid grid-cols-3 gap-4 px-4 py-3 items-center hover:bg-white/5 rounded-lg transition-colors border-b border-gray-800/50 last:border-0"
                >
                  <div className="text-white font-medium text-left truncate flex flex-col">
                    <span>{user.username}</span>
                    {user.polla_id && selectedPolla === "TODAS" && (
                      <span className="text-[10px] text-gray-500 tracking-wider truncate">
                        {pollaName || user.polla_id}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center">
                    {isSubmitted ? (
                      <span className="bg-green-900/40 text-green-400 border border-green-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                        🔒 ENVIADO
                      </span>
                    ) : (
                      <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                        ✏️ BORRADOR
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center text-sm">
                    {isSubmitted ? (
                      <button
                        onClick={() => handleOpenLock(user.id, user.username)}
                        disabled={processingId === user.id}
                        className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-1 rounded shadow-md font-bold text-xs transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1"
                      >
                        {processingId === user.id ? "⏳..." : "🔓 ABRIR"}
                      </button>
                    ) : (
                      <span className="text-gray-600 font-medium">
                        - Disponible -
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800 flex justify-center bg-[#0a0a0a] rounded-b-xl z-10 relative">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-gray-700"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
