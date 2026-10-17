"use client";
import { useState } from "react";
import { useStage } from "@/lib/store/stage";
import { Button } from "@/components/ui/button";

export function ExportPanel() {
  const { stageOutputs, currentStageStatus } = useStage();
  const [copied, setCopied] = useState(false);

  const hasAnyComplete = Object.values(currentStageStatus).some((s) => s === "complete");
  if (!hasAnyComplete) return null;

  const handleMarkdownExport = () => {
    const stages = ["research", "reasoning", "coding", "final"] as const;
    let md = "# VIBER // Synaptic AI Synthesis Output\n\n";
    for (const stage of stages) {
      md += `## Stage: ${stage.toUpperCase()}\n\n`;
      const workers = ["worker1", "worker2", "worker3", "master"] as const;
      for (const worker of workers) {
        const content = stageOutputs[stage][worker];
        md += `### ${worker === "master" ? "Executive Master Synthesis" : worker.toUpperCase()}\n\n${content || "_No output yet_"}\n\n`;
      }
      md += "\n---\n\n";
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viber-synthesis.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonExport = () => {
    const json = JSON.stringify({ viberSession: stageOutputs, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viber-synthesis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAllMasters = () => {
    const combined = [
      stageOutputs.research.master ? `## Research Master:\n${stageOutputs.research.master}` : null,
      stageOutputs.reasoning.master ? `## Reasoning Master:\n${stageOutputs.reasoning.master}` : null,
      stageOutputs.coding.master ? `## Coding Master:\n${stageOutputs.coding.master}` : null,
      stageOutputs.final.master ? `## Final Synthesis:\n${stageOutputs.final.master}` : null,
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(combined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel synaptic-gradient-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-violet-500/20 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
          <span className="material-symbols-outlined text-base">file_download</span>
        </div>
        <div>
          <h4 className="text-sm font-headline font-bold text-white">Export Synaptic Intelligence</h4>
          <p className="text-[11px] font-mono text-slate-400">Download formatted reports or copy master takeaways</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkdownExport}
          className="bg-surface-container/60 text-slate-200 border-white/10 hover:border-violet-500/40 hover:text-white text-xs h-9"
        >
          <span className="material-symbols-outlined text-sm mr-1.5">markdown</span>
          Export Markdown
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleJsonExport}
          className="bg-surface-container/60 text-slate-200 border-white/10 hover:border-violet-500/40 hover:text-white text-xs h-9"
        >
          <span className="material-symbols-outlined text-sm mr-1.5">data_object</span>
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAllMasters}
          className="bg-gradient-to-r from-violet-600/30 to-amber-500/30 text-white border-violet-400/30 hover:border-violet-400/60 text-xs h-9"
        >
          <span className="material-symbols-outlined text-sm mr-1.5">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied All!" : "Copy Master Consensus"}
        </Button>
      </div>
    </div>
  );
}