"use client";
import React, { useState } from "react";
import { useStage } from "@/lib/store/stage";
import { useModelConfig } from "@/lib/store/models";

export function ViberPromptDock({
  onSend,
  isProcessing = false,
  onOpenModelModal,
}: {
  onSend: (promptText: string) => void;
  isProcessing?: boolean;
  onOpenModelModal?: () => void;
}) {
  const { prompt, setPrompt, current } = useStage();
  const { slots, apiKey, setApiKey, provider, setProvider } = useModelConfig();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || "");

  const currentModel = slots[`${current}.worker1`] || "Auto Router";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isProcessing) {
        onSend(prompt);
      }
    }
  };

  const handleSaveKey = () => {
    setApiKey(tempKey.trim());
    setShowKeyInput(false);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Top Utility Links & Quick API Key Bar */}
      <div className="flex items-center justify-between px-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              apiKey
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <span className="material-symbols-outlined text-sm">key</span>
            <span>{apiKey ? "API Key Connected" : "Enter API Key"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenModelModal}
            className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Options</span>
          </button>

          <button
            type="button"
            onClick={onOpenModelModal}
            className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Model: {currentModel.split("/").pop() || "Default"}</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Press Enter ↵ to send
        </span>
      </div>

      {/* Inline Quick API Key Bar */}
      {showKeyInput && (
        <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-white border border-slate-200 shadow-md animate-in fade-in">
          <span className="material-symbols-outlined text-slate-400 text-sm">vpn_key</span>
          <input
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="Paste OpenRouter, Groq, OpenAI, or Gemini key..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveKey();
            }}
          />
          <button
            type="button"
            onClick={handleSaveKey}
            className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Save Key
          </button>
          <button
            type="button"
            onClick={() => setShowKeyInput(false)}
            className="text-xs text-slate-400 hover:text-slate-700 px-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main Rounded Input Capsule Bar */}
      <div className="w-full rounded-full bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-2 pl-5 flex items-center gap-3 transition-all focus-within:border-slate-400 focus-within:shadow-[0_4px_28px_rgba(0,0,0,0.1)]">
        {/* Sparkle Icon */}
        <span className="text-slate-400 text-sm select-none">✦</span>

        {/* Input Field */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Viber anything... (e.g. write code, explain a concept, analyze ideas)"
          className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm font-medium"
        />

        {/* Mic Button */}
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Voice Input"
        >
          <span className="material-symbols-outlined text-base">mic</span>
        </button>

        {/* Send Upward Arrow Button */}
        <button
          type="button"
          disabled={!prompt.trim() || isProcessing}
          onClick={() => onSend(prompt)}
          className="w-9 h-9 rounded-full bg-[#181920] hover:bg-[#2B2D38] text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-[#181920] shadow-sm active:scale-95 cursor-pointer"
          title="Send Query"
        >
          <span className="material-symbols-outlined text-base">
            {isProcessing ? "progress_activity" : "arrow_upward"}
          </span>
        </button>
      </div>
    </div>
  );
}
