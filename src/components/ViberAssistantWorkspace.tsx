"use client";
import React, { useState, useRef, useEffect } from "react";
import { ViberCoreOrb } from "@/components/ViberCoreOrb";
import { ViberPromptDock } from "@/components/ViberPromptDock";
import { StreamingPane } from "@/components/StreamingPane";
import { StageActions } from "@/components/StageActions";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useStage } from "@/lib/store/stage";
import { useModelConfig, type ModelSlotKey } from "@/lib/store/models";
import { WORKER_ROLE_MAP } from "@/lib/worker-roles";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function ViberAssistantWorkspace({
  onStartProcessing,
  isProcessing: externalProcessing,
  onOpenModelModal,
  startTrigger,
  masterTrigger,
  handleWorkerComplete,
  handleMasterComplete,
  getExtraBody,
}: {
  onStartProcessing: (text?: string) => void;
  isProcessing: boolean;
  onOpenModelModal?: () => void;
  startTrigger: number;
  masterTrigger: number;
  handleWorkerComplete: (worker: string, content: string) => void;
  handleMasterComplete: (worker: string, content: string) => void;
  getExtraBody: (isMaster: boolean) => Record<string, unknown>;
}) {
  const {
    current,
    setStage,
    prompt,
    setPrompt,
    sessionId,
    enabled,
    stageOutputs,
    currentStageStatus,
    clearStageOutputs,
    setCurrentStageStatus,
    advanceToNextStage,
  } = useStage();

  const { apiKey, provider, slots } = useModelConfig();

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDirectStreaming, setIsDirectStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "workers">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStreaming =
    isDirectStreaming ||
    Object.values(currentStageStatus).some(
      (s) => s === "workers_streaming" || s === "master_streaming"
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle direct message execution
  const handleDirectChat = async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: userText.trim(),
      timestamp: Date.now(),
    };

    const assistantMsgId = Math.random().toString(36).slice(2);
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsDirectStreaming(true);

    try {
      const selectedModel = slots[`${current}.worker1`] || "meta-llama/llama-3.3-70b-instruct";
      const response = await fetch("/api/stream/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-provider-key": apiKey || "",
        },
        body: JSON.stringify({
          prompt: userText,
          provider: provider || "openrouter",
          model: selectedModel,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const payload = line.replace("data:", "").trim();
            try {
              const json = JSON.parse(payload);
              if (json?.text) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: msg.content + json.text } : msg
                  )
                );
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: `Error: ${err?.message || "Failed to stream response"}` }
            : msg
        )
      );
    } finally {
      setIsDirectStreaming(false);
      setPrompt("");
    }
  };

  const handleSendPrompt = (text: string) => {
    if (activeTab === "workers") {
      onStartProcessing(text);
    } else {
      handleDirectChat(text);
    }
  };

  const suggestions = [
    "Write a high-performance Python script to parse and analyze JSON data",
    "Explain quantum computing simply with an intuitive real-world analogy",
    "Compare PostgreSQL vs SQLite for scalable local-first applications",
    "Generate a Next.js 16 App Router API endpoint with SSE streaming",
  ];

  const stagesList = [
    { key: "research", label: "01. Research", icon: "radar" },
    { key: "reasoning", label: "02. Reasoning", icon: "psychology" },
    { key: "coding", label: "03. Coding", icon: "code" },
    { key: "final", label: "04. Synthesis", icon: "all_inclusive" },
  ] as const;

  const isMasterDisabled =
    currentStageStatus[current] !== "master_streaming" && currentStageStatus[current] !== "complete";

  return (
    <div className="flex-1 flex flex-col justify-between h-full relative min-h-[600px] p-2 sm:p-4">
      {/* Top Bar: Online Status & Mode Switcher */}
      <div className="flex items-center justify-between w-full mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
            <span>Viber Assistant Online</span>
          </div>

          {apiKey ? (
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Live API Connected
            </span>
          ) : (
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Demo Mode (Add key in dock for live LLM)
            </span>
          )}
        </div>

        {/* View Toggle: Direct Chat vs Multi-Worker Matrix */}
        <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Direct Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workers")}
            className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === "workers"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Multi-Worker Matrix
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "chat" ? (
        /* Direct Conversation View */
        <div className="flex-1 w-full flex flex-col overflow-y-auto pr-1 my-auto">
          {messages.length === 0 ? (
            /* Welcome Hero with 3D Core Orb */
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-4">
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight mb-2">
                Welcome
              </h2>
              <p className="text-slate-500 text-sm font-medium mb-4">
                How can I help you today?
              </p>

              {/* 3D Core Visualizer */}
              <div className="my-2">
                <ViberCoreOrb isStreaming={isStreaming} />
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto mt-2 mb-4">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleDirectChat(item)}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-slate-200/90 text-left"
                  >
                    ✦ {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat Thread */
            <div className="space-y-4 py-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#181920] text-white shadow-sm rounded-br-sm"
                        : "bg-white text-slate-800 border border-slate-200/90 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" && !msg.content ? (
                      <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
                        <span>Viber is thinking...</span>
                      </div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                    {msg.role === "user" ? "You" : "Viber AI"}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      ) : (
        /* Parallel Worker Streaming Matrix Mode */
        <div className="flex-1 w-full my-auto overflow-y-auto py-2 pr-1">
          {/* Stage Switcher Pills */}
          <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {stagesList.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStage(s.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    current === s.key
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-slate-400 font-semibold hidden md:inline">
              Stage: {current.toUpperCase()}
            </span>
          </div>

          {/* 4 Streaming Panes Grid (3 Workers + 1 Master) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-2">
            <ErrorBoundary>
              <StreamingPane
                slotKey={`${current}.worker1` as ModelSlotKey}
                stage={current}
                worker="worker1"
                sessionId={sessionId}
                prompt={prompt}
                enabled={enabled[current]}
                startTrigger={startTrigger}
                onContentComplete={handleWorkerComplete}
                extraBody={getExtraBody(false)}
                roleLabel={WORKER_ROLE_MAP[`${current}.worker1`]}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <StreamingPane
                slotKey={`${current}.worker2` as ModelSlotKey}
                stage={current}
                worker="worker2"
                sessionId={sessionId}
                prompt={prompt}
                enabled={enabled[current]}
                startTrigger={startTrigger}
                onContentComplete={handleWorkerComplete}
                extraBody={getExtraBody(false)}
                roleLabel={WORKER_ROLE_MAP[`${current}.worker2`]}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <StreamingPane
                slotKey={`${current}.worker3` as ModelSlotKey}
                stage={current}
                worker="worker3"
                sessionId={sessionId}
                prompt={prompt}
                enabled={enabled[current]}
                startTrigger={startTrigger}
                onContentComplete={handleWorkerComplete}
                extraBody={getExtraBody(false)}
                roleLabel={WORKER_ROLE_MAP[`${current}.worker3`]}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <StreamingPane
                slotKey={`${current}.master` as ModelSlotKey}
                stage={current}
                worker="master"
                sessionId={sessionId}
                prompt={prompt}
                enabled={enabled[current]}
                startTrigger={masterTrigger}
                disabled={isMasterDisabled}
                onContentComplete={handleMasterComplete}
                extraBody={getExtraBody(true)}
                roleLabel={WORKER_ROLE_MAP[`${current}.master`]}
              />
            </ErrorBoundary>
          </div>

          {/* Stage Controls */}
          <StageActions
            stage={current}
            isComplete={currentStageStatus[current] === "complete"}
            isFinalStage={current === "final"}
            onReanalyze={() => {
              clearStageOutputs(current);
              setCurrentStageStatus(current, "idle");
              onStartProcessing();
            }}
            onChatMore={(followUp) => {
              setPrompt(prompt + "\n\nFollow-up: " + followUp);
              onStartProcessing(prompt + "\n\nFollow-up: " + followUp);
            }}
            onSendToNext={advanceToNextStage}
          />
        </div>
      )}

      {/* Bottom Floating Prompt Dock */}
      <div className="w-full pt-2 shrink-0">
        <ViberPromptDock
          onSend={(text) => handleSendPrompt(text)}
          isProcessing={isStreaming}
          onOpenModelModal={onOpenModelModal}
        />
      </div>
    </div>
  );
}
