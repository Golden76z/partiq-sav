"use client";

import { useState } from "react";

interface Preset {
  label: string;
  icon: string;
  question: string;
  basePrompt: string;
  action?: string;
}

interface ChatPresetsProps {
  presets: Preset[];
  onSelect: (action: string, prompt: string, question: string, basePrompt: string) => void;
}

export function ChatPresets({ presets, onSelect }: ChatPresetsProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="px-4 py-1.5 text-xs text-delabie-blue hover:bg-delabie-blue-pale transition-colors text-left border-b border-gray-100 flex-shrink-0"
      >
        ↓ Afficher les raccourcis
      </button>
    );
  }

  return (
    <div className="border-b border-gray-100 px-3 py-2 flex-shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Raccourcis</span>
        <button onClick={() => setVisible(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Masquer
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p.action ?? "", p.basePrompt, p.question, p.basePrompt)}
            className="flex items-center gap-1 px-2.5 py-1 bg-delabie-gray hover:bg-delabie-blue-pale text-delabie-text hover:text-delabie-blue rounded-full text-xs font-medium transition-colors border border-transparent hover:border-delabie-blue/20"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
