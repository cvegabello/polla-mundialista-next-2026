"use client";

import { useState, useEffect } from "react";
import {
  X,
  Copy,
  CheckCircle,
  Share2,
  Loader2,
  MessageCircle,
  Mail,
  MessageSquare,
  Globe,
} from "lucide-react";
import { getInviteCodeAction } from "@/lib/actions/fan-actions";

interface FanInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollaId: string;
  pollaName: string;
  initialLang?: "es" | "en"; // Para que arranque en el idioma que tiene el fan
}

export const FanInviteModal = ({
  isOpen,
  onClose,
  pollaId,
  pollaName,
  initialLang = "es",
}: FanInviteModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteLang, setInviteLang] = useState<"es" | "en">(initialLang);

  // 🚀 Apenas se abre el modal, vamos a buscar el código
  useEffect(() => {
    if (isOpen && pollaId) {
      const fetchCode = async () => {
        setLoading(true);
        setError("");
        const result = await getInviteCodeAction(pollaId);

        if (result.success && result.inviteCode) {
          const domain = window.location.origin;
          setMagicLink(`${domain}/login?invite=${result.inviteCode}`);
        } else {
          setError(
            inviteLang === "es"
              ? "Error al obtener el enlace de invitación."
              : "Error fetching invitation link.",
          );
        }
        setLoading(false);
      };
      fetchCode();
    }
  }, [isOpen, pollaId, inviteLang]);

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(magicLink);
    } else {
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* 🏟️ EL ESTADIO DE FONDO */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-[2px] pointer-events-none z-0"
          style={{
            backgroundImage:
              "url('/images/FIFAWCup-26-Stadium-New-York-New-Jersey.avif')",
          }}
        />

        <div className="relative z-10">
          <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 p-4 border-b border-gray-700 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400">
              <Share2 size={20} />
              <h2 className="font-bold text-lg uppercase">
                {inviteLang === "es" ? "Invitar Amigos" : "Invite Friends"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="animate-spin text-cyan-500" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm drop-shadow-md">
                  {inviteLang === "es"
                    ? "Generando Enlace..."
                    : "Generating Link..."}
                </p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-900/80 backdrop-blur-sm border border-red-500/50 text-red-200 text-sm rounded-lg text-center font-bold">
                {error}
              </div>
            ) : (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-white drop-shadow-md">
                  {inviteLang === "es" ? "¡Enlace Listo!" : "Link Ready!"}
                </h3>
                <p className="text-gray-300 text-sm drop-shadow-md">
                  {inviteLang === "es" ? (
                    <>
                      Comparte este enlace para que más amigos se unan a{" "}
                      <strong className="text-white">{pollaName}</strong>.
                    </>
                  ) : (
                    <>
                      Share this link so more friends can join{" "}
                      <strong className="text-white">{pollaName}</strong>.
                    </>
                  )}
                </p>

                {/* ENLACE MÁGICO */}
                <div className="mt-4 p-3 bg-gray-950/80 backdrop-blur-sm border border-gray-800 rounded-lg flex items-center justify-between gap-2">
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
                <div className="pt-4 mt-4 border-t border-gray-800/80">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Globe size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider drop-shadow-md">
                      {inviteLang === "es"
                        ? "Idioma del mensaje:"
                        : "Message Language:"}
                    </span>
                    <div className="flex bg-black/70 rounded-lg p-1 border border-gray-800 backdrop-blur-sm">
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
                      <div className="w-12 h-12 bg-[#25D366]/20 backdrop-blur-sm text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white rounded-full flex items-center justify-center transition-all">
                        <MessageCircle size={24} />
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold drop-shadow-md">
                        WhatsApp
                      </span>
                    </a>
                    <a
                      href={`sms:?&body=${encodeURIComponent(inviteTexts[inviteLang].sms)}`}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white rounded-full flex items-center justify-center transition-all">
                        <MessageSquare size={24} />
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold drop-shadow-md">
                        SMS
                      </span>
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(inviteTexts[inviteLang].emailSubj)}&body=${encodeURIComponent(inviteTexts[inviteLang].emailBody)}`}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 bg-red-500/20 backdrop-blur-sm text-red-500 group-hover:bg-red-500 group-hover:text-white rounded-full flex items-center justify-center transition-all">
                        <Mail size={24} />
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold drop-shadow-md">
                        Email
                      </span>
                    </a>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="mt-6 w-full py-3 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-white font-bold rounded-xl transition border border-gray-700"
                >
                  {inviteLang === "es" ? "Cerrar Panel" : "Close Panel"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
