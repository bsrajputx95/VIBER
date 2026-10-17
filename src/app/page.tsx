"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { ViberStarLogo } from "@/components/ViberStarLogo";
import { ViberSidebarNav } from "@/components/ViberSidebarNav";
import { ViberOverviewPanel } from "@/components/ViberOverviewPanel";
import { ViberAssistantWorkspace } from "@/components/ViberAssistantWorkspace";
import { ProviderSelector } from "@/components/ProviderSelector";
import { ExportPanel } from "@/components/ExportPanel";
import { useStage } from "@/lib/store/stage";
import { useAuth } from "@/lib/store/auth";

export default function Home() {
  const [activeMode, setActiveMode] = useState<"Prompt" | "Agent">("Agent");
  const [activeSidebarView, setActiveSidebarView] = useState("automations");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    current,
    setStage,
    sessionId,
    newSession,
    prompt,
    setPrompt,
    enabled,
    stageOutputs,
    setStageOutput,
    currentStageStatus,
    setCurrentStageStatus,
  } = useStage();

  const { user } = useAuth();

  const [startTrigger, setStartTrigger] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [masterTrigger, setMasterTrigger] = useState(0);
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

  const handleStartProcessing = (customText?: string) => {
    const query = customText || prompt;
    if (!query.trim()) {
      alert("Please enter a prompt before starting processing.");
      return;
    }
    if (!enabled[current]) {
      alert(`Please enable the ${current} stage before starting processing.`);
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#DEE7F0] via-[#E8EDF5] to-[#F5E6DC] p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center font-headline antialiased selection:bg-slate-900 selection:text-white">
      {/* Main Workspace Surface */}
      <div className="w-full max-w-[1600px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-[32px] md:rounded-[40px] bg-[#FAFAFC] border border-white/80 shadow-[0_25px_80px_rgba(20,30,60,0.12)] flex flex-col overflow-hidden relative">
        
        {/* Top Header / Navigation Bar */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-slate-200/70 flex items-center justify-between gap-4 bg-white/70 backdrop-blur-md shrink-0 z-30">
          {/* Left: Star Badge + Mode Pill Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ViberStarLogo size={38} variant="icon" />

            {/* [ Prompt | Agent ] Pill Toggle */}
            <div className="flex items-center p-1 rounded-full bg-[#ECEEF2] border border-slate-200/60 shadow-inner">
              {(["Prompt", "Agent"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  className={`px-3 sm:px-4 py-1 rounded-full text-xs font-headline font-bold transition-all cursor-pointer ${
                    activeMode === mode
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 lg:hidden"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
            </button>
          </div>

          {/* Center: Search Capsule Pill Bar */}
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <div className="w-full h-9 rounded-full bg-[#F1F3F7] border border-slate-200/60 px-4 flex items-center gap-2.5 shadow-inner">
              <span className="material-symbols-outlined text-slate-400 text-base">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts, sessions, or models..."
                className="w-full bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Model & Provider Settings"
              >
                <span className="material-symbols-outlined text-base">settings</span>
              </button>
            </div>
          </div>

          {/* Right: Actions, Log Out, Premium, User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Logged out session")}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Log Out
            </button>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#181920] hover:bg-[#2B2D38] text-white text-xs font-bold font-headline shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Premium
            </button>

            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0 cursor-pointer">
              <div className="w-full h-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase() || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* 3-Column Body Container */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Column 1: Leftmost Navigation Sidebar (Width ~220px) */}
          <aside className="hidden lg:flex w-56 shrink-0 border-r border-slate-200/70 p-4 overflow-y-auto bg-slate-50/40">
            <ViberSidebarNav
              activeView={activeSidebarView}
              setActiveView={setActiveSidebarView}
              onOpenSettings={() => setShowConfigModal(true)}
            />
          </aside>

          {/* Column 2: Middle Overview & Progress Column (Width ~300px) */}
          <section className="hidden xl:flex w-80 shrink-0 border-r border-slate-200/70 p-5 overflow-y-auto bg-white/50">
            <ViberOverviewPanel
              onRun={() => handleStartProcessing()}
              onOpenConfig={() => setShowConfigModal(true)}
            />
          </section>

          {/* Column 3: Main Workspace Panel */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white/80 p-3 sm:p-5 md:p-6 relative">
            <ViberAssistantWorkspace
              onStartProcessing={(text) => handleStartProcessing(text)}
              isProcessing={isProcessing}
              onOpenModelModal={() => setShowConfigModal(true)}
              startTrigger={startTrigger}
              masterTrigger={masterTrigger}
              handleWorkerComplete={handleWorkerComplete}
              handleMasterComplete={handleMasterComplete}
              getExtraBody={getExtraBody}
            />
          </main>
        </div>

        {/* Settings / Model Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <ViberStarLogo size={32} variant="icon" />
                  <div>
                    <h3 className="font-headline font-bold text-lg text-slate-900">
                      Viber Model & Provider Settings
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Configure OpenRouter, Groq, Anthropic, Gemini, and parallel slots
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <ProviderSelector />

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#181920] text-white text-xs font-bold font-headline hover:bg-slate-800 transition-colors"
                >
                  Save & Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Export Session Artifacts
                </h3>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <ExportPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}