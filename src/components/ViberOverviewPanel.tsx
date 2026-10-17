"use client";
import React from "react";
import { CapsuleProgressGauges } from "@/components/CapsuleProgressGauges";
import { CollaboratorAvatars } from "@/components/CollaboratorAvatars";
import { useStage } from "@/lib/store/stage";

export function ViberOverviewPanel({
  onRun,
  onOpenConfig,
}: {
  onRun?: () => void;
  onOpenConfig?: () => void;
}) {
  const { current, currentStageStatus, stageOutputs } = useStage();

  const isStreaming = Object.values(currentStageStatus).some(
    (s) => s === "workers_streaming" || s === "master_streaming"
  );

  const completedCount = Object.values(currentStageStatus).filter((s) => s === "complete").length;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Header Card: Pipeline Matrix Status */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 font-headline">
            Neural Pipeline Matrix
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">
            Stage: <strong className="text-slate-900 capitalize">{current}</strong> ({completedCount}/4 Done)
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenConfig}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Configure Models & Providers"
        >
          <span className="material-symbols-outlined text-base">tune</span>
        </button>
      </div>

      {/* 4 Capsule Progress Gauges */}
      <CapsuleProgressGauges />

      {/* Parallel Workers & Run Synthesis Button */}
      <CollaboratorAvatars onRun={onRun} />

      {/* Distribution: Multi-Model Workers vs Consolidator */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-slate-400 font-headline">
            INFERENCE SLOTS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase font-mono">Parallel</span>
            <span className="text-xl font-headline font-bold text-slate-800 mt-1">3 Workers</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase font-mono">Executive</span>
            <span className="text-xl font-headline font-bold text-slate-800 mt-1">1 Master</span>
          </div>
        </div>
      </div>

      {/* Channels / Consensus Dial */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-800 font-headline">Inference Telemetry</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-blue-500" />
            <span>SSE Streams: {isStreaming ? "Active" : "Standby"}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-purple-500" />
            <span>Latency: ~18ms</span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-purple-500"
              strokeDasharray={`${completedCount * 25 || (isStreaming ? 65 : 20)}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[11px] font-bold font-mono text-slate-800">
            {completedCount * 25}%
          </span>
        </div>
      </div>
    </div>
  );
}
