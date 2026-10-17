"use client";
import React from "react";
import { useStage, type Stage } from "@/lib/store/stage";

export function CapsuleProgressGauges() {
  const { current, setStage, currentStageStatus, stageOutputs } = useStage();

  const stages: {
    key: Stage;
    title: string;
    subtext: string;
    color: string;
    accent: string;
  }[] = [
    {
      key: "research",
      title: "Research",
      subtext: "Alpha",
      color: "from-[#8CBF26] to-[#A8D33F]",
      accent: "text-[#6B961A]",
    },
    {
      key: "reasoning",
      title: "Reasoning",
      subtext: "Beta",
      color: "from-[#E6A020] to-[#F7C644]",
      accent: "text-[#B87D10]",
    },
    {
      key: "coding",
      title: "Coding",
      subtext: "Gamma",
      color: "from-[#B080D8] to-[#CF9EEA]",
      accent: "text-[#8E51BF]",
    },
    {
      key: "final",
      title: "Synthesis",
      subtext: "Omega",
      color: "from-[#1F2937] to-[#374151]",
      accent: "text-[#111827]",
    },
  ];

  const getStageMetric = (stageKey: Stage) => {
    const status = currentStageStatus[stageKey];
    const hasMaster = Boolean(stageOutputs[stageKey]?.master);
    if (status === "complete" || hasMaster) {
      return { fill: "95%", statusLabel: "Done ✓" };
    }
    if (status === "workers_streaming" || status === "master_streaming") {
      return { fill: "60%", statusLabel: "Active" };
    }
    return { fill: "20%", statusLabel: "Ready" };
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-slate-400 font-headline">
          STAGE PROGRESS
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
          Active: <strong className="text-slate-800">{current}</strong>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {stages.map((stage) => {
          const { fill, statusLabel } = getStageMetric(stage.key);
          const isCurrent = current === stage.key;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => setStage(stage.key)}
              className={`flex flex-col items-center p-1 rounded-xl transition-all cursor-pointer ${
                isCurrent ? "bg-slate-100/90 ring-1 ring-slate-300" : "hover:bg-slate-50"
              }`}
            >
              {/* Title */}
              <span className="text-[10px] text-slate-600 font-bold truncate max-w-full">
                {stage.title}
              </span>

              {/* Vertical Capsule Bar */}
              <div className="w-full h-22 sm:h-24 rounded-[18px] bg-[#F1F3F7] p-1 flex flex-col justify-end overflow-hidden relative my-1.5">
                <div
                  className={`w-full rounded-[14px] bg-gradient-to-t ${stage.color} transition-all duration-700 shadow-sm`}
                  style={{ height: fill }}
                />
              </div>

              {/* Status / Percentage */}
              <span className={`text-[10px] font-bold truncate ${stage.accent}`}>
                {statusLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
