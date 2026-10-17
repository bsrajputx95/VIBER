"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Stage } from "@/lib/store/stage";

type StageActionsProps = {
  stage: Stage;
  isComplete: boolean;
  isFinalStage: boolean;
  onReanalyze: () => void;
  onChatMore: (followUp: string) => void;
  onSendToNext: () => void;
};

export function StageActions({
  isComplete,
  isFinalStage,
  onReanalyze,
  onChatMore,
  onSendToNext,
}: StageActionsProps) {
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onReanalyze}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span>Re-analyze</span>
        </button>

        <button
          type="button"
          onClick={() => setShowChatInput((v) => !v)}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">chat</span>
          <span>Chat More</span>
        </button>

        {!isFinalStage && (
          <button
            type="button"
            disabled={!isComplete}
            onClick={onSendToNext}
            className="px-4 py-1.5 rounded-xl bg-[#181920] hover:bg-[#2B2D38] disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:pointer-events-none"
          >
            <span>Advance to Next Stage</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>

      {showChatInput && (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
          <Textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Enter your follow-up instruction for this stage..."
            className="min-h-[70px] text-xs bg-white border-slate-200 text-slate-800"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowChatInput(false)}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (chatInput.trim()) {
                  onChatMore(chatInput);
                  setChatInput("");
                  setShowChatInput(false);
                }
              }}
              disabled={!chatInput.trim()}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold"
            >
              Submit Follow-up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}