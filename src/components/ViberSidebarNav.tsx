"use client";
import React from "react";
import { useStage, type Stage } from "@/lib/store/stage";

export function ViberSidebarNav({
  activeView,
  setActiveView,
  onOpenSettings,
  onOpenExport,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
}) {
  const { current, setStage, newSession } = useStage();

  const stages: { id: Stage; label: string; icon: string; num: string }[] = [
    { id: "research", label: "01. Research", icon: "radar", num: "α" },
    { id: "reasoning", label: "02. Reasoning", icon: "psychology", num: "β" },
    { id: "coding", label: "03. Coding", icon: "code", num: "γ" },
    { id: "final", label: "04. Synthesis", icon: "all_inclusive", num: "Ω" },
  ];

  return (
    <div className="w-56 shrink-0 flex flex-col justify-between h-full py-2 select-none">
      <div className="flex flex-col gap-5">
        {/* New Session Button */}
        <div className="px-1">
          <button
            type="button"
            onClick={() => newSession()}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 font-headline font-bold text-xs hover:border-slate-300 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200">
                <span className="material-symbols-outlined text-sm">add</span>
              </span>
              <span>New Pipeline</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Ctrl+N</span>
          </button>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="flex flex-col space-y-1 px-1">
          <span className="px-3 text-[10px] font-extrabold tracking-[0.1em] uppercase text-slate-400 font-headline mb-1">
            PIPELINE STAGES
          </span>
          {stages.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setStage(s.id);
                setActiveView(s.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                current === s.id
                  ? "bg-slate-100/90 text-slate-900 font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-slate-400">
                  {s.icon}
                </span>
                <span>{s.label}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {s.num}
              </span>
            </button>
          ))}
        </div>

        {/* Workspace Management */}
        <div className="flex flex-col space-y-1 px-1 pt-2 border-t border-slate-200/60">
          <span className="px-3 text-[10px] font-extrabold tracking-[0.1em] uppercase text-slate-400 font-headline mb-1">
            MANAGEMENT
          </span>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-slate-400">tune</span>
            <span>Model Matrix</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-slate-400">download</span>
            <span>Export Artifacts</span>
          </button>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Viber OS v2.6</span>
        </span>
        <span className="text-slate-400">4-Stage</span>
      </div>
    </div>
  );
}
