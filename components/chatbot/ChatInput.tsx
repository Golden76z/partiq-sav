"use client";

import { useState, KeyboardEvent } from "react";

export function ChatInput({ onSend, disabled, placeholder }: { onSend: (msg: string) => void; disabled?: boolean; placeholder?: string }) {
  const [value, setValue] = useState("");

  const send = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="border-t border-gray-100 px-3 py-2 flex items-end gap-2 bg-white flex-shrink-0">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder ?? "Posez votre question SAV…"}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue focus:border-delabie-blue disabled:opacity-50 max-h-24 overflow-y-auto"
        style={{ minHeight: "38px" }}
      />
      <button
        onClick={send}
        disabled={!value.trim() || disabled}
        className="w-9 h-9 bg-delabie-blue text-white rounded-xl flex items-center justify-center hover:bg-delabie-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}
