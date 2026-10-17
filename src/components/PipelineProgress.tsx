"use client";
import { useStage } from "@/lib/store/stage";

type StepState = "complete" | "active" | "pending";

const STAGES = ["research", "reasoning", "coding", "final"] as const;

const STAGE_CONFIG: Record<
  (typeof STAGES)[number],
  {
    num: string;
    label: string;
    sublabel: string;
    description: string;
    icon: string;
    accent: string;
  }
> = {
  research: {
    num: "01",
    label: "Research",
    sublabel: "Alpha Perception",
    description: "Multi-source intelligence & data reconnaissance",
    icon: "radar",
    accent: "from-cyan-500/20 to-blue-500/10 border-cyan-400/30 text-cyan-400",
  },
  reasoning: {
    num: "02",
    label: "Reasoning",
    sublabel: "Beta Cognition",
    description: "Causal graphs, architecture & multi-agent logic",
    icon: "psychology",
    accent: "from-violet-500/20 to-indigo-500/10 border-violet-400/30 text-violet-400",
  },
  coding: {
    num: "03",
    label: "Coding",
    sublabel: "Gamma Generation",
    description: "Robust implementation, algorithms & test matrix",
    icon: "terminal",
    accent: "from-fuchsia-500/20 to-pink-500/10 border-fuchsia-400/30 text-fuchsia-400",
  },
  final: {
    num: "04",
    label: "Synthesis",
    sublabel: "Omega Consensus",
    description: "Master executive consolidation & final deliverable",
    icon: "all_inclusive",
    accent: "from-amber-500/20 to-orange-500/10 border-amber-400/30 text-amber-400",
  },
};

export function PipelineProgress() {
  const { currentStageStatus, current, setStage } = useStage();

  const getStepState = (stage: (typeof STAGES)[number]): StepState => {
    const status = currentStageStatus[stage];
    if (status === "complete") return "complete";
    if (status === "workers_streaming" || status === "master_streaming") return "active";
    return "pending";
  };

  const steps = STAGES.map((stage) => ({
    stage,
    ...STAGE_CONFIG[stage],
    state: getStepState(stage),
    isSelected: current === stage,
  }));

  const completedCount = steps.filter((s) => s.state === "complete").length;
  const isRunning = steps.some((s) => s.state === "active");
  const activeLabel =
    steps.find((s) => s.state === "active")?.label ||
    (steps.every((s) => s.state === "complete") ? "Complete" : "Standby");

  return (
    <section className="glass-panel synaptic-gradient-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_12px_40px_rgba(5,7,20,0.6)]">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-violet-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-32 bg-amber-500/10 blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600/25 to-amber-500/20 border border-violet-400/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <span
              className="material-symbols-outlined text-violet-300 text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-lg font-bold tracking-tight text-white">
                Synaptic Pipeline Orchestration
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container-highest border border-white/10 text-slate-300">
                4-Stage Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {completedCount} of {STAGES.length} neural stages synthesized
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <div className="flex items-center gap-2.5 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(255,122,0,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span className="text-[11px] text-amber-300 font-mono font-bold uppercase tracking-widest">
                {activeLabel} IN PROGRESS
              </span>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-white/10 text-[11px] font-mono text-slate-400">
            AUTO-CONVERGE: <span className="text-violet-400 font-bold">ON</span>
          </div>
        </div>
      </div>

      {/* Stage Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {steps.map((step, idx) => {
          const isComplete = step.state === "complete";
          const isActive = step.state === "active";

          return (
            <div key={step.stage} className="relative">
              {/* Connecting Wave Line for Desktop */}
              {idx < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+28px)] right-[-16px] h-0.5 z-0 hidden md:block">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isComplete
                        ? "bg-gradient-to-r from-violet-500 to-amber-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                        : isActive
                        ? "bg-gradient-to-r from-amber-500/60 to-violet-500/20 animate-pulse"
                        : "bg-white/[0.06]"
                    }`}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setStage(step.stage)}
                className={`w-full text-left relative z-10 flex flex-col p-4 rounded-2xl transition-all duration-300 group cursor-pointer ${
                  step.isSelected
                    ? "bg-surface-container-highest/80 border-2 border-violet-400/50 shadow-[0_0_30px_rgba(139,92,246,0.18)]"
                    : isActive
                    ? "bg-amber-500/[0.08] border border-amber-500/30 shadow-[0_0_25px_rgba(255,122,0,0.12)]"
                    : isComplete
                    ? "bg-surface-container/60 border border-emerald-500/30 hover:border-emerald-500/50"
                    : "bg-surface-container/30 border border-white/[0.06] hover:bg-surface-container/60 hover:border-white/15"
                }`}
              >
                {/* Top Badge: Number and Status */}
                <div className="flex items-center justify-between mb-3 w-full">
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                    STAGE {step.num}
                  </span>
                  {isComplete ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="material-symbols-outlined text-xs">done</span> DONE
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-full">
                      QUEUED
                    </span>
                  )}
                </div>

                {/* Stage Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-amber-500/30 to-violet-600/30 border border-amber-400/50 shadow-[0_0_15px_rgba(255,122,0,0.25)] text-amber-300"
                      : isComplete
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:text-violet-300"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: isComplete ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isComplete ? "task_alt" : step.icon}
                  </span>
                </div>

                {/* Stage Name & Subtitle */}
                <span className="text-sm font-headline font-bold text-white group-hover:text-violet-200 transition-colors">
                  {step.label}
                </span>
                <span className="text-[10px] font-mono text-violet-400/80 uppercase tracking-wider font-semibold">
                  {step.sublabel}
                </span>
                <p className="text-[11px] text-slate-400/70 mt-1 line-clamp-2 leading-tight">
                  {step.description}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}