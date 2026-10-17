"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamingPane } from "@/components/StreamingPane";
import { ProviderSelector } from "@/components/ProviderSelector";
import { StageActions } from "@/components/StageActions";
import { useStage, type Stage } from "@/lib/store/stage";
import { WORKER_ROLE_MAP } from "@/lib/worker-roles";
import { type ModelSlotKey } from "@/lib/store/models";
import { useEffect, useState, useRef, useCallback } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function StagePanel() {
  const {
    current,
    setStage,
    sessionId,
    newSession,
    prompt,
    setPrompt,
    enabled,
    setStageEnabled,
    stageOutputs,
    setStageOutput,
    clearStageOutputs,
    setCurrentStageStatus,
    advanceToNextStage,
    currentStageStatus,
    clearConversation,
  } = useStage();

  const [startTrigger, setStartTrigger] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [masterTrigger, setMasterTrigger] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const workerCompletedCount = useRef(0);
  const workerOutputsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!sessionId) newSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWorkerComplete = useCallback(
    (worker: string, content: string) => {
      workerOutputsRef.current[worker] = content;
      setStageOutput(current, worker as "worker1" | "worker2" | "worker3" | "master", content);
      workerCompletedCount.current++;
      if (workerCompletedCount.current >= 3) {
        setCurrentStageStatus(current, "master_streaming");
        setMasterTrigger((prev) => prev + 1);
      }
    },
    [current, setStageOutput, setCurrentStageStatus]
  );

  const handleMasterComplete = useCallback(
    (_worker: string, content: string) => {
      setStageOutput(current, "master", content);
      setCurrentStageStatus(current, "complete");
      setIsProcessing(false);
    },
    [current, setStageOutput, setCurrentStageStatus]
  );

  const handleStartProcessing = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt before starting processing.");
      return;
    }
    if (!enabled[current]) {
      alert("Please enable the current stage before starting processing.");
      return;
    }
    setIsProcessing(true);
    workerCompletedCount.current = 0;
    workerOutputsRef.current = {};
    setCurrentStageStatus(current, "workers_streaming");
    setStartTrigger((prev) => prev + 1);
  };

  const getExtraBody = useCallback(
    (isMaster: boolean) => {
      const extra: Record<string, unknown> = {};
      if (isMaster) {
        extra.workerOutputs = Object.values(workerOutputsRef.current);
      }
      if (current !== "research") {
        const prevStage =
          current === "reasoning" ? "research" : current === "coding" ? "reasoning" : "coding";
        const prevMasterOutput = stageOutputs[prevStage]?.master;
        if (prevMasterOutput) {
          extra.previousStageContext = prevMasterOutput;
        }
      }
      return extra;
    },
    [current, stageOutputs]
  );

  const renderStage = (stage: "research" | "reasoning" | "coding" | "final") => {
    const isMasterDisabled =
      currentStageStatus[stage] !== "master_streaming" && currentStageStatus[stage] !== "complete";
    const stageStatus = currentStageStatus[stage];
    const extraBody = getExtraBody(false);

    return (
      <div className="space-y-6 pb-28">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <ErrorBoundary>
            <StreamingPane
              slotKey={`${stage}.worker1` as ModelSlotKey}
              stage={stage}
              worker="worker1"
              sessionId={sessionId}
              prompt={prompt}
              enabled={enabled[stage]}
              startTrigger={startTrigger}
              onContentComplete={handleWorkerComplete}
              extraBody={extraBody}
              roleLabel={WORKER_ROLE_MAP[`${stage}.worker1`]}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StreamingPane
              slotKey={`${stage}.worker2` as ModelSlotKey}
              stage={stage}
              worker="worker2"
              sessionId={sessionId}
              prompt={prompt}
              enabled={enabled[stage]}
              startTrigger={startTrigger}
              onContentComplete={handleWorkerComplete}
              extraBody={extraBody}
              roleLabel={WORKER_ROLE_MAP[`${stage}.worker2`]}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StreamingPane
              slotKey={`${stage}.worker3` as ModelSlotKey}
              stage={stage}
              worker="worker3"
              sessionId={sessionId}
              prompt={prompt}
              enabled={enabled[stage]}
              startTrigger={startTrigger}
              onContentComplete={handleWorkerComplete}
              extraBody={extraBody}
              roleLabel={WORKER_ROLE_MAP[`${stage}.worker3`]}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StreamingPane
              slotKey={`${stage}.master` as ModelSlotKey}
              stage={stage}
              worker="master"
              sessionId={sessionId}
              prompt={prompt}
              enabled={enabled[stage]}
              startTrigger={masterTrigger}
              disabled={isMasterDisabled}
              onContentComplete={handleMasterComplete}
              extraBody={getExtraBody(true)}
              roleLabel={WORKER_ROLE_MAP[`${stage}.master`]}
            />
          </ErrorBoundary>
        </section>

        <StageActions
          stage={stage}
          isComplete={stageStatus === "complete"}
          isFinalStage={stage === "final"}
          onReanalyze={() => {
            clearStageOutputs(stage);
            workerCompletedCount.current = 0;
            workerOutputsRef.current = {};
            setCurrentStageStatus(stage, "idle");
            setIsProcessing(true);
            setCurrentStageStatus(current, "workers_streaming");
            setStartTrigger((prev) => prev + 1);
          }}
          onChatMore={(followUp) => {
            setPrompt(prompt + "\n\nFollow-up: " + followUp);
            setIsProcessing(true);
            workerCompletedCount.current = 0;
            workerOutputsRef.current = {};
            setCurrentStageStatus(current, "workers_streaming");
            setStartTrigger((prev) => prev + 1);
          }}
          onSendToNext={advanceToNextStage}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-36 w-full">
      {/* Synaptic Engine Configuration Collapsible Panel */}
      <div className="glass-panel rounded-3xl border border-violet-500/20 overflow-hidden shadow-[0_8px_32px_rgba(7,9,24,0.6)]">
        <div
          className="flex items-center justify-between p-5 md:px-7 cursor-pointer hover:bg-white/[0.02] transition-colors"
          onClick={() => setConfigOpen(!configOpen)}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600/25 to-cyan-500/20 border border-violet-400/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-violet-300 text-lg">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-base font-bold text-white tracking-tight">
                  Neural Model & Provider Matrix
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  Configure
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                OpenRouter, Groq, Anthropic, Gemini, OpenAI & more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stage checkboxes */}
            <div className="hidden lg:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {(["research", "reasoning", "coding", "final"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-2 px-3 py-1 rounded-xl border cursor-pointer transition-all text-[11px] font-mono font-bold uppercase ${
                    enabled[s]
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                      : "border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabled[s]}
                    onChange={(e) => setStageEnabled(s, e.target.checked)}
                    className="sr-only"
                    aria-label={`Enable ${s} stage`}
                  />
                  <span className={`w-1.5 h-1.5 rounded-full ${enabled[s] ? "bg-amber-400" : "bg-slate-600"}`} />
                  {s === "final" ? "Synthesis" : s}
                </label>
              ))}
            </div>

            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {configOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
          </div>
        </div>

        {configOpen && (
          <div className="p-6 md:p-8 border-t border-white/[0.08] bg-surface-container/40">
            <ProviderSelector />
          </div>
        )}
      </div>

      {/* Stage Tabs Navigation */}
      <Tabs value={current} onValueChange={(v) => setStage(v as Stage)} className="w-full">
        <TabsList className="mb-6 flex flex-wrap bg-surface-container/60 backdrop-blur-2xl border border-violet-500/20 rounded-2xl p-1.5 h-auto gap-2">
          <TabsTrigger
            value="research"
            className="rounded-xl px-5 py-2.5 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400/30 data-[state=active]:border font-headline font-bold text-xs uppercase tracking-wider transition-all hover:text-slate-200"
          >
            01. Research
          </TabsTrigger>
          <TabsTrigger
            value="reasoning"
            className="rounded-xl px-5 py-2.5 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-violet-300 data-[state=active]:border-violet-400/30 data-[state=active]:border font-headline font-bold text-xs uppercase tracking-wider transition-all hover:text-slate-200"
          >
            02. Reasoning
          </TabsTrigger>
          <TabsTrigger
            value="coding"
            className="rounded-xl px-5 py-2.5 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-fuchsia-300 data-[state=active]:border-fuchsia-400/30 data-[state=active]:border font-headline font-bold text-xs uppercase tracking-wider transition-all hover:text-slate-200"
          >
            03. Coding
          </TabsTrigger>
          <TabsTrigger
            value="final"
            className="rounded-xl px-5 py-2.5 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/25 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-300 data-[state=active]:border-amber-400/40 data-[state=active]:border font-headline font-bold text-xs uppercase tracking-wider transition-all hover:text-slate-200"
          >
            04. Synthesis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research">{renderStage("research")}</TabsContent>
        <TabsContent value="reasoning">{renderStage("reasoning")}</TabsContent>
        <TabsContent value="coding">{renderStage("coding")}</TabsContent>
        <TabsContent value="final">{renderStage("final")}</TabsContent>
      </Tabs>

      {/* Floating Prompt Dock */}
      <footer className="fixed bottom-0 left-0 lg:left-72 right-0 z-50 flex flex-col items-center pb-6 pt-16 px-6 pointer-events-none bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-4xl w-full glass-panel synaptic-gradient-border rounded-3xl p-2.5 shadow-[0_-10px_60px_rgba(0,0,0,0.6),0_0_50px_rgba(139,92,246,0.15)] flex flex-col sm:flex-row items-center gap-3 px-5 pointer-events-auto border border-violet-500/30">
          {/* Quick Stage Indicator Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {current.toUpperCase()}
            </span>
          </div>

          {/* Prompt Input */}
          <div className="flex-1 w-full">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 text-sm py-2.5 h-12 resize-none outline-none overflow-hidden font-body leading-snug"
              placeholder="Ask Viber to analyze, reason, implement, and synthesize... (Press Enter to execute)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleStartProcessing();
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              className="p-2.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer rounded-xl hover:bg-white/[0.05]"
              onClick={clearConversation}
              title="Clear Prompt & Context"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
            </button>

            <button
              disabled={isProcessing || !prompt.trim()}
              onClick={handleStartProcessing}
              className="bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 text-white px-5 py-3 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all active:scale-95 disabled:opacity-35 disabled:hover:shadow-none cursor-pointer"
            >
              <span>{isProcessing ? "Synthesizing..." : `Synthesize ${current.charAt(0).toUpperCase() + current.slice(1)}`}</span>
              <span className="material-symbols-outlined text-base">
                {isProcessing ? "progress_activity" : "auto_awesome"}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}