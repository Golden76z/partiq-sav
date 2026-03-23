"use client";

import { useEffect, useRef } from "react";
import type { Message } from "./ChatWidget";

interface ChatMessagesProps {
  messages: Message[];
  streaming: boolean;
  onSuggestionClick: (text: string) => void;
}

// Parse a markdown link [label](url) → { label, url } or null
function parseLink(token: string): { label: string; url: string } | null {
  const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!m) return null;
  return { label: m[1], url: m[2] };
}

// Split text into tokens: markdown links, bold, plain text
type Token =
  | { type: "link";  label: string; url: string }
  | { type: "bold";  text: string }
  | { type: "text";  text: string };

function tokenize(content: string): Token[] {
  const tokens: Token[] = [];
  // Match [label](url) or **bold** or plain text
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", text: content.slice(last, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("[")) {
      const link = parseLink(raw);
      if (link) tokens.push({ type: "link", label: link.label, url: link.url });
      else tokens.push({ type: "text", text: raw });
    } else {
      tokens.push({ type: "bold", text: raw.slice(2, -2) });
    }
    last = match.index + raw.length;
  }
  if (last < content.length) {
    tokens.push({ type: "text", text: content.slice(last) });
  }
  return tokens;
}

// Detect list items in assistant messages (lines starting with - , • , or N. )
function extractSuggestions(content: string): string[] {
  const lines = content.split("\n");
  const suggestions: string[] = [];
  const listLine = /^(\s*[-•]\s+|\s*\d+\.\s+)(.+)/;

  for (const line of lines) {
    const m = line.match(listLine);
    if (!m) continue;
    // Strip markdown bold/links from the item text
    const text = m[2].replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[[^\]]+\]\([^)]+\)/g, "").trim();
    // Only include short, clean items that look like product names or references (not sentences)
    if (text.length > 2 && text.length < 80 && !text.endsWith(":")) {
      suggestions.push(text);
    }
  }
  return suggestions.slice(0, 6); // max 6 chips
}

function renderTokens(tokens: Token[], isUser: boolean) {
  return tokens.map((tok, i) => {
    if (tok.type === "bold") {
      return <strong key={i}>{tok.text}</strong>;
    }
    if (tok.type === "link") {
      const isDownload = tok.url.includes("/download");
      return (
        <a
          key={i}
          href={tok.url}
          target={isDownload ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 underline font-medium ${
            isUser ? "text-blue-200 hover:text-white" : "text-delabie-blue hover:text-delabie-blue-dark"
          }`}
        >
          {isDownload && (
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {tok.label}
        </a>
      );
    }
    // Plain text — preserve newlines
    return (
      <span key={i}>
        {tok.text.split("\n").map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

function Bubble({
  msg,
  onSuggestionClick,
}: {
  msg: Message;
  onSuggestionClick: (text: string) => void;
}) {
  const isUser      = msg.role === "user";
  const tokens      = tokenize(msg.content);
  const suggestions = !isUser && msg.content.length > 0 ? extractSuggestions(msg.content) : [];

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-1.5`}>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2 w-full`}>
        {!isUser && (
          <div className="w-6 h-6 bg-delabie-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        )}
        <div
          className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-delabie-blue text-white rounded-br-sm"
              : "bg-delabie-gray text-delabie-text rounded-bl-sm"
          }`}
        >
          {msg.content === "" ? (
            <span className="inline-flex gap-1">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          ) : renderTokens(tokens, isUser)}
        </div>
      </div>

      {/* Clickable suggestion chips */}
      {suggestions.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 pl-8 max-w-[90%]`}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s)}
              className="text-xs px-2.5 py-1 bg-white border border-delabie-blue/30 text-delabie-blue rounded-full hover:bg-delabie-blue hover:text-white transition-colors font-medium shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatMessages({ messages, streaming, onSuggestionClick }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
      {messages.map((m) => (
        <Bubble key={m.id} msg={m} onSuggestionClick={onSuggestionClick} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
