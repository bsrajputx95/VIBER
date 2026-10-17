"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useModelConfig, type ModelSlotKey } from "@/lib/store/models";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ModelSearch } from "@/components/ModelSearch";

type StreamingPaneProps = {
  stage: "research" | "reasoning" | "coding" | "final";
  worker: "worker1" | "worker2" | "worker3" | "master";
  sessionId: string;
  autoStart?: boolean;
  prompt?: string;
  enabled?: boolean;
  slotKey: ModelSlotKey;
  startTrigger?: number;
  onComplete?: () => void;
  onContentComplete?: (worker: string, content: string) => void;
  disabled?: boolean;
  extraBody?: Record<string, unknown>;
  roleLabel?: string;
};

export function StreamingPane({
  stage,
  worker,
  sessionId,
  autoStart,
  prompt,
  enabled = true,
  slotKey,
  startTrigger,
  onComplete,
  onContentComplete,
  disabled = false,
  extraBody,
  roleLabel,
}: StreamingPaneProps) {
  const [content, setContent] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");
  const { options, slots, setSlot, provider } = useModelConfig();
  const [editing, setEditing] = useState(false);
  const [nextModel, setNextModel] = useState<string>("");
  const [modelSearch, setModelSearch] = useState<string>("");
  const startTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isMaster = worker === "master";

  const start = async () => {
    if (running || !enabled) return;
    setRunning(true);
    setDone(false);
    setContent("");
    setElapsedMs(null);
    contentRef.current = "";
    startTimeRef.current = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`/api/stream/${stage}`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-provider-key": useModelConfig.getState().apiKey || "",
        },
        body: JSON.stringify({
          worker,
          sessionId,
          prompt: prompt?.trim() ?? "",
          model: slots[slotKey] ?? "",
          provider,
          ...extraBody,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";
      let streamDone = false;

      while (true) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            const payload = line.replace("data:", "").trim();
            if (currentEvent === "message") {
              try {
                const json = JSON.parse(payload);
                if (json?.text) {
                  contentRef.current += json.text;
                  setContent((prev) => prev + json.text);
                } else if (json?.error) {
                  const errText = `\n\nError: ${String(json.error)}`;
                  contentRef.current += errText;
                  setContent((prev) => prev + errText);
                }
              } catch {
                contentRef.current += payload;
                setContent((prev) => prev + payload);
              }
            } else if (currentEvent === "done") {
              streamDone = true;
              setRunning(false);
              setDone(true);
              if (startTimeRef.current) {
                setElapsedMs(Date.now() - startTimeRef.current);
              }
              onContentComplete?.(worker, contentRef.current);
              onComplete?.();
              break;
            }
          } else if (line.trim() === "") {
            currentEvent = "";
          }
        }
      }

      if (!streamDone) {
        setRunning(false);
        onContentComplete?.(worker, contentRef.current);
        onComplete?.();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        const errText = `\n\nError: ${String(error)}`;
        contentRef.current += errText;
        setContent((prev) => prev + errText);
      }
      setRunning(false);
    }
  };

  useEffect(() => {
    if (autoStart) start();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, worker, sessionId]);

  useEffect(() => {
    if (startTrigger && startTrigger > 0 && enabled) {
      setRetryCount(0);
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTrigger]);

  const getStatusBadge = () => {
    if (disabled) {
      return { dot: "bg-slate-400", text: "Awaiting workers", badgeClass: "bg-slate-100 text-slate-500 border-slate-200" };
    }
    if (running && !done) {
      return { dot: "bg-amber-500 animate-pulse", text: "Inferring...", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (done) {
      return { dot: "bg-emerald-500", text: "Converged ✓", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (!running && !done && content.includes("\n\nError:")) {
      return { dot: "bg-rose-500", text: "Error", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    return { dot: "bg-slate-400", text: "Standby", badgeClass: "bg-slate-100 text-slate-500 border-slate-200" };
  };

  const status = getStatusBadge();
  const hasError = !running && !done && content.includes("Error:");

  const workerThemes: Record<string, { icon: string; border: string; text: string; bg: string }> = {
    worker1: { icon: "radar", border: "border-blue-100", text: "text-blue-600", bg: "bg-blue-50" },
    worker2: { icon: "psychology", border: "border-purple-100", text: "text-purple-600", bg: "bg-purple-50" },
    worker3: { icon: "code", border: "border-fuchsia-100", text: "text-fuchsia-600", bg: "bg-fuchsia-50" },
    master: { icon: "all_inclusive", border: "border-amber-200", text: "text-amber-700", bg: "bg-amber-50" },
  };

  const currentTheme = workerThemes[worker] || workerThemes.worker1;

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 relative flex flex-col h-[400px] overflow-hidden group transition-all duration-300 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
        isMaster ? "md:col-span-2 ring-1 ring-amber-300/60 bg-gradient-to-b from-amber-50/20 to-white" : ""
      } ${!enabled ? "opacity-35 grayscale" : ""}`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentTheme.bg} ${currentTheme.text}`}
          >
            <span className="material-symbols-outlined text-base">
              {currentTheme.icon}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-bold text-xs sm:text-sm text-slate-900">
                {roleLabel || (isMaster ? "Viber Master Synthesizer" : `Worker ${worker.replace("worker", "")}`)}
              </span>
              {isMaster && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 font-bold uppercase">
                  Consensus
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">
                {slots[slotKey] || "Auto Router"}
              </span>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                disabled={!enabled || options.length === 0}
                className="text-slate-400 hover:text-slate-700 text-xs px-1 py-0.5 rounded transition-colors"
                title="Change Model"
              >
                ✎
              </button>
            </div>
          </div>
        </div>

        {/* Status Badge & Copy */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${status.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span>{status.text}</span>
          </div>

          {hasError && retryCount < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                start();
                setRetryCount((c) => c + 1);
              }}
              className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50"
            >
              ⟳ Retry
            </Button>
          )}

          <button
            type="button"
            disabled={!content}
            onClick={() => {
              navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Copy Output"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        </div>
      </div>

      {/* Model Selector Overlay */}
      {editing && (
        <div className="mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 relative z-20">
          <div className="flex-1">
            <Select value={nextModel || undefined} onValueChange={(v) => setNextModel(v)}>
              <SelectTrigger className="w-full bg-white text-slate-800 border-slate-200 text-xs h-8">
                <SelectValue placeholder="Choose model" />
              </SelectTrigger>
              <SelectContent>
                <div onPointerDown={(e) => e.preventDefault()}>
                  <ModelSearch value={modelSearch} onChange={setModelSearch} placeholder="Filter models..." />
                </div>
                {options
                  .filter(
                    (opt) =>
                      opt.label.toLowerCase().includes(modelSearch.toLowerCase()) ||
                      opt.id.toLowerCase().includes(modelSearch.toLowerCase())
                  )
                  .map((opt) => (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            disabled={!nextModel}
            onClick={() => {
              if (nextModel) setSlot(slotKey, nextModel);
              setEditing(false);
            }}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
            className="h-8 text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Output Content Scroll Area */}
      <ScrollArea className="flex-1 h-full w-full pr-2 relative z-10">
        <div className="text-xs sm:text-sm leading-relaxed text-slate-700">
          {disabled ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-2xl mb-1.5 animate-bounce">
                hourglass_top
              </span>
              <p className="text-[11px] font-mono">
                Awaiting parallel worker convergence before synthesis...
              </p>
            </div>
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : running ? (
            <div className="space-y-2.5 py-3">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-600 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Streaming model response...</span>
              </div>
              <Skeleton className="h-3.5 w-3/4 bg-slate-100" />
              <Skeleton className="h-3.5 w-1/2 bg-slate-100" />
              <Skeleton className="h-3.5 w-5/6 bg-slate-100" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <span className="material-symbols-outlined text-xl">neurology</span>
              </div>
              <p className="text-[11px] font-mono">
                Ready. Submit a prompt below to trigger this worker.
              </p>
            </div>
          )}

          {done && elapsedMs !== null && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-3 mt-3 border-t border-slate-100">
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-xs">done_all</span> Inferred in {(elapsedMs / 1000).toFixed(2)}s
              </span>
              <span>Tokens: ~{(content.length / 4).toFixed(0)}</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}