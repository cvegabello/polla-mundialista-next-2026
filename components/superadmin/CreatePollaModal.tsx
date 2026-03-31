"use client";

import { useState } from "react";
import {
  X,
  Copy,
  CheckCircle,
  Trophy,
  Loader2,
  MessageCircle,
  Mail,
  MessageSquare,
  Globe,
} from "lucide-react";
// 👇 Asegúrese de que esta importación coincida con el nuevo nombre de la función
import { createPollaOnly } from "@/lib/actions/super-admin-actions";

interface CreatePollaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePollaModal({
  isOpen,
  onClose,
}: CreatePollaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [copied, setCopied] = useState(false);

  const [pollaName, setPollaName] = useState("");
  const [inviteLang, setInviteLang] = useState<"es" | "en">("es"); // 👈 Estado del Idioma

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMagicLink("");

    const result = await createPollaOnly(pollaName);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const domain = window.location.origin;
    setMagicLink(`${domain}/login?invite=${result.inviteCode}`);
    setLoading(false);
  };

  // 🛡️ Función de copiar blindada contra el error de HTTP/localhost
  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(magicLink);
    } else {
      // Plan B si falla el portapapeles moderno (ej. probando en IP local)
      const textArea = document.createElement("textarea");
      textArea.value = magicLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🌍 Textos de Invitación según el idioma
  const inviteTexts = {
    es: {
      wa: `¡Hola! Estás invitado a unirte a mi grupo "${pollaName}" para el Mundial 2026. Haz clic aquí para crear tu usuario y unirte: ${magicLink}`,
      sms: `Únete a la polla "${pollaName}" aquí: ${magicLink}`,
      emailSubj: `Invitación: Polla del Mundial - ${pollaName}`,
      emailBody: `¡Hola!\n\nEstás invitado a participar en la polla "${pollaName}" para el Mundial 2026.\n\nHaz clic en el siguiente enlace para crear tu usuario y pronósticos:\n\n${magicLink}\n\n¡Que gane el mejor!`,
    },
    en: {
      wa: `Hi! You are invited to join my group "${pollaName}" for the 2026 World Cup. Click here to create your user and join: ${magicLink}`,
      sms: `Join the "${pollaName}" pool here: ${magicLink}`,
      emailSubj: `Invitation: World Cup Pool - ${pollaName}`,
      emailBody: `Hi!\n\nYou're invited to participate in the "${pollaName}" World Cup pool.\n\nClick the link below to create your account and submit your predictions:\n\n${magicLink}\n\nMay the best fan win!`,
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-cyan-400">
            <Trophy size={20} />
            <h2 className="font-bold text-lg uppercase">Crear Nueva Polla</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {magicLink ? (
            /* 🏆 ESTADO DE ÉXITO */
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">¡Polla Creada!</h3>
              <p className="text-gray-400 text-sm">
                La polla <strong className="text-white">{pollaName}</strong>{" "}
                está lista. Envía este link para que los fans se unan.
              </p>

              <div className="mt-4 p-3 bg-gray-950 border border-gray-800 rounded-lg flex items-center justify-between gap-2">
                <span className="text-cyan-400 font-mono text-sm truncate">
                  {magicLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition"
                >
                  {copied ? (
                    <CheckCircle size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>

              {/* 🌍 SELECTOR DE IDIOMA */}
              <div className="pt-4 mt-4 border-t border-gray-800">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Globe size={16} className="text-gray-500" />
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Idioma del mensaje:
                  </span>
                  <div className="flex bg-black/50 rounded-lg p-1 border border-gray-800">
                    <button
                      onClick={() => setInviteLang("es")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition ${inviteLang === "es" ? "bg-cyan-600 text-white" : "text-gray-500 hover:text-white"}`}
                    >
                      ES
                    </button>
                    <button
                      onClick={() => setInviteLang("en")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition ${inviteLang === "en" ? "bg-cyan-600 text-white" : "text-gray-500 hover:text-white"}`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {/* BOTONES DE COMPARTIR */}
                <div className="flex justify-center gap-4">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(inviteTexts[inviteLang].wa)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white rounded-full flex items-center justify-center transition-all">
                      <MessageCircle size={24} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">
                      WhatsApp
                    </span>
                  </a>
                  <a
                    href={`sms:?&body=${encodeURIComponent(inviteTexts[inviteLang].sms)}`}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white rounded-full flex items-center justify-center transition-all">
                      <MessageSquare size={24} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">
                      SMS
                    </span>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(inviteTexts[inviteLang].emailSubj)}&body=${encodeURIComponent(inviteTexts[inviteLang].emailBody)}`}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white rounded-full flex items-center justify-center transition-all">
                      <Mail size={24} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">
                      Correo
                    </span>
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition"
              >
                Cerrar Panel
              </button>
            </div>
          ) : (
            /* 📝 ESTADO DE FORMULARIO */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Nombre de la nueva Polla
                </label>
                <input
                  required
                  value={pollaName}
                  onChange={(e) => setPollaName(e.target.value)}
                  placeholder="Ej. Los Invencibles"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none text-lg font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Crear Polla y Generar Link"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
