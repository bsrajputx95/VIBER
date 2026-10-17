"use client";
import React from "react";
import { useStage } from "@/lib/store/stage";
import { useModelConfig, type ModelSlotKey } from "@/lib/store/models";

export function CollaboratorAvatars({ onRun }: { onRun?: () => void }) {
  const { current, currentStageStatus } = useStage();
  const { slots } = useModelConfig();

  const isStreaming = Object.values(currentStageStatus).some(
    (s) => s === "workers_streaming" || s === "master_streaming"
  );

  const workers = [
    {
      id: "worker1",
      slotKey: `${current}.worker1`,
      name: "Alpha",
      role: "Perception & Research",
      color: "from-blue-500 to-indigo-600",
      initial: "α",
    },
    {
      id: "worker2",
      slotKey: `${current}.worker2`,
      name: "Beta",
      role: "Logic & Reasoning",
      color: "from-amber-500 to-orange-600",
      initial: "β",
    },
    {
      id: "worker3",
      slotKey: `${current}.worker3`,
      name: "Gamma",
      role: "Code & Implementation",
      color: "from-purple-500 to-fuchsia-600",
      initial: "γ",
    },
    {
      id: "master",
      slotKey: `${current}.master`,
      name: "Omega",
      role: "Master Consolidator",
      color: "from-slate-800 to-slate-950",
      initial: "Ω",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-slate-400 font-headline">
          PARALLEL WORKERS
        </span>
        <span className="text-[10px] font-mono text-slate-500 font-semibold">
          3 Workers + Master
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-3">
        {/* Avatars Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {workers.map((w) => {
              const modelName = (slots[w.slotKey as ModelSlotKey] || "Default").split("/").pop();
              return (
                <div
                  key={w.id}
                  title={`${w.name}: ${w.role} (${modelName})`}
                  className="relative group cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-tr ${w.color} flex items-center justify-center text-white font-headline font-bold text-xs shadow-sm border-2 border-white transition-transform group-hover:scale-110`}
                  >
                    {w.initial}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            {current.toUpperCase()}
          </span>
        </div>

        {/* Action Button: Run Parallel Synthesis */}
        <button
          type="button"
          onClick={onRun}
          disabled={isStreaming}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#181920] to-[#2B2D38] hover:from-[#111217] hover:to-[#22242D] text-white text-xs font-semibold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isStreaming ? "Synthesizing consensus..." : `Run ${current.toUpperCase()} Synthesis`}</span>
          <span className="material-symbols-outlined text-sm">
            {isStreaming ? "progress_activity" : "bolt"}
          </span>
        </button>
      </div>
    </div>
  );
}
