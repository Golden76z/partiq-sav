"use client";

import { useState, useRef, useCallback } from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatPresets } from "./ChatPresets";
import { useRouter } from "next/navigation";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface PendingPreset {
  basePrompt: string;
}

// Each preset defines the question the bot asks before sending
const PRESET_QUERIES = [
  {
    label: "Référence",
    icon: "🔍",
    question: "De quel produit souhaitez-vous connaître la référence ?",
    basePrompt: "Donne-moi la référence exacte du produit suivant : ",
    action: "reference",
  },
  {
    label: "Fiche PDF",
    icon: "📄",
    question: "Pour quel produit ou référence souhaitez-vous la fiche technique PDF ?",
    basePrompt: "Fournis-moi le lien de téléchargement de la fiche technique PDF pour : ",
    action: "pdf",
  },
  {
    label: "Pièces détachées",
    icon: "🔧",
    question: "Pour quel produit ou référence souhaitez-vous la liste des pièces détachées ?",
    basePrompt: "Liste-moi toutes les pièces détachées disponibles pour : ",
    action: "spareparts",
  },
  {
    label: "Compatibilité",
    icon: "✅",
    question: "Quelle pièce souhaitez-vous vérifier, et sur quel produit ?",
    basePrompt: "Vérifie la compatibilité de cette pièce/référence : ",
    action: "compat",
  },
  {
    label: "Diagnostic",
    icon: "🛠️",
    question: "Décrivez le problème rencontré avec votre produit (marque, modèle, symptôme) :",
    basePrompt: "Aide-moi à diagnostiquer ce problème SAV : ",
    action: "diag",
  },
  {
    label: "Déposer un doc",
    icon: "📎",
    question: "",
    basePrompt: "",
    action: "upload",
  },
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Bonjour ! Je suis votre assistant SAV pour les produits **DELABIE**, **KWC** et **DVS**.\n\nQue souhaitez-vous faire ?\n- Trouver la référence d'un produit\n- Obtenir une fiche technique PDF\n- Lister les pièces détachées d'un produit\n- Vérifier la compatibilité d'une pièce\n- Diagnostiquer une panne",
};

export function ChatWidget() {
  const [open, setOpen]                   = useState(false);
  const [messages, setMessages]           = useState<Message[]>([WELCOME_MSG]);
  const [streaming, setStreaming]         = useState(false);
  const [uploadOpen, setUploadOpen]       = useState(false);
  const [pendingPreset, setPendingPreset] = useState<PendingPreset | null>(null);
  const [confirmClear, setConfirmClear]   = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const router                            = useRouter();

  const handleNewChat = useCallback(() => {
    if (confirmClear) {
      setMessages([{ ...WELCOME_MSG, id: crypto.randomUUID() }]);
      setPendingPreset(null);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  }, [confirmClear]);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || streaming) return;

      // If a preset is waiting, prepend the base prompt to user's answer
      const fullContent = pendingPreset
        ? pendingPreset.basePrompt + userText
        : userText;

      setPendingPreset(null);

      const userMsg: Message      = { id: crypto.randomUUID(), role: "user",      content: userText };
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: fullContent }],
          }),
        });

        if (!res.ok) {
          let errorMessage = "Une erreur est survenue. Veuillez reessayer.";
          try {
            const data = await res.json();
            if (typeof data?.error === "string" && data.error.trim()) {
              errorMessage = data.error;
            }
          } catch {
            // Ignore JSON parsing errors and keep the fallback message.
          }
          throw new Error(errorMessage);
        }

        const reader  = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6);
            if (raw === "[DONE]") break;
            try {
              const { content: delta } = JSON.parse(raw);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m
                )
              );
            } catch { /* skip */ }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error && error.message.trim()
            ? error.message
            : "Une erreur est survenue. Veuillez reessayer.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: errorMessage }
              : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, pendingPreset]
  );

  const handlePreset = useCallback(
    (action: string, _prompt: string, question: string, basePrompt: string) => {
      if (action === "upload") {
        setUploadOpen(true);
        return;
      }
      // Push the bot's clarifying question as an assistant message
      const questionMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: question,
      };
      setMessages((prev) => [...prev, questionMsg]);
      setPendingPreset({ basePrompt });
    },
    []
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion);
    },
    [sendMessage]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadOpen(false);
      const uploadMsg: Message     = { id: crypto.randomUUID(), role: "user",      content: `📎 Analyse du document : **${file.name}**` };
      const processingMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "⏳ Analyse en cours…" };

      setMessages((prev) => [...prev, uploadMsg, processingMsg]);
      setStreaming(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });

        if (!res.ok) {
          const err = await res.json();
          setMessages((prev) =>
            prev.map((m) => m.id === processingMsg.id ? { ...m, content: `❌ Erreur : ${err.error}` } : m)
          );
          return;
        }

        const doc = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === processingMsg.id
              ? {
                  ...m,
                  content: `✅ Document analysé !\n\n**${doc.name}**\nType : ${doc.type}${doc.brand ? `\nMarque : ${doc.brand.name}` : ""}\n\nRedirection vers l'aperçu…`,
                }
              : m
          )
        );
        setTimeout(() => router.push(`/preview/${doc.id}`), 1500);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === processingMsg.id ? { ...m, content: "❌ Erreur lors du traitement." } : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-delabie-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-delabie-blue-dark transition-all duration-200 hover:scale-105"
        aria-label="Assistant SAV"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "780px" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Header */}
          <div className="bg-delabie-blue px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Assistant SAV</p>
              <p className="text-blue-200 text-xs">DELABIE · KWC · DVS</p>
            </div>
            {pendingPreset && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                En attente…
              </span>
            )}
            {/* New chat button */}
            <button
              onClick={handleNewChat}
              title={confirmClear ? "Cliquez à nouveau pour confirmer" : "Nouvelle conversation"}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                confirmClear
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {confirmClear ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Confirmer
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau
                </>
              )}
            </button>
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Presets */}
          <ChatPresets presets={PRESET_QUERIES} onSelect={handlePreset} />

          {/* Messages */}
          <ChatMessages
            messages={messages}
            streaming={streaming}
            onSuggestionClick={handleSuggestionClick}
          />

          {/* Upload overlay */}
          {uploadOpen && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="bg-white rounded-xl p-6 mx-4 text-center shadow-xl w-full max-w-xs">
                <p className="font-semibold text-delabie-text mb-1">Déposer un document</p>
                <p className="text-xs text-gray-500 mb-4">PDF, Excel, CSV, Word</p>
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-delabie-blue rounded-xl p-6 hover:bg-delabie-blue-pale transition-colors">
                    <p className="text-sm text-delabie-blue font-medium">Cliquer ou déposer ici</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.docx"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                </label>
                <button onClick={() => setUploadOpen(false)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            disabled={streaming}
            placeholder={pendingPreset ? "Tapez votre réponse…" : "Posez votre question SAV…"}
          />
        </div>
      )}
    </>
  );
}
