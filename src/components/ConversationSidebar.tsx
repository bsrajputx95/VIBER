"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStage } from "@/lib/store/stage";
import { useAuth } from "@/lib/store/auth";
import { ViberLogo } from "@/components/ViberLogo";

type ConversationType = {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
  stageOutputs: Record<string, { master: string }>;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SidebarContent({
  conversations,
  search,
  setSearch,
  loading,
  error,
  onDelete,
  onSelect,
  onNew,
}: {
  conversations: ConversationType[];
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onSelect: (conv: ConversationType) => void;
  onNew: () => void;
}) {
  const { user } = useAuth();
  const { stageOrder } = useStage();

  const filtered = conversations.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface-container-low/95 text-slate-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <ViberLogo size="sm" variant="full" badge="v2.6" />
          <Button
            size="sm"
            onClick={onNew}
            className="bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs h-7 px-2.5"
          >
            + New
          </Button>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search neural history..."
          className="h-8 text-xs bg-surface-container/60 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50"
        />
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && <div className="text-xs text-slate-400 p-2 font-mono">Syncing neural sessions...</div>}
        {error && (
          <div className="text-[10px] text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 m-2 flex items-center gap-2 font-mono tracking-wide">
            <span className="material-symbols-outlined text-sm">cloud_off</span>
            {error === "No database configured" ? "Local Session Mode" : error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-xs text-slate-500 p-4 text-center font-mono">No previous sessions found.</div>
        )}
        {filtered.map((conv) => (
          <div
            key={conv.id}
            className="group flex flex-col gap-1 p-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-violet-500/20 cursor-pointer transition-all"
            onClick={() => onSelect(conv)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate flex-1">{conv.title || "Untitled Session"}</span>
              <button
                className="opacity-0 group-hover:opacity-100 text-xs text-rose-400 hover:text-rose-300 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this session?")) {
                    onDelete(conv.id);
                  }
                }}
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 font-mono">{timeAgo(conv.createdAt)}</span>
              <div className="flex gap-1 ml-auto">
                {stageOrder.map((s) => (
                  <div
                    key={s}
                    title={`${s} stage`}
                    className={`w-1.5 h-1.5 rounded-full ${
                      conv.stageOutputs?.[s]?.master ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
            <span className="material-symbols-outlined text-sm">fingerprint</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-[11px] leading-tight truncate max-w-[140px]">
              {user ? user.email || user.username || "Viber Operator" : "Guest Operator"}
            </span>
            <span className="text-[9px] font-mono text-cyan-400">Autonomous Tier</span>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
      </div>
    </div>
  );
}

export function ConversationSidebar({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { setPrompt, setStageOutput, setCurrentStageStatus, stageOrder, clearConversation } = useStage();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/conversations")
      .then((res) => {
        if (!res.ok) throw new Error("No database configured");
        return res.json();
      })
      .then((data) => {
        setConversations(data.conversations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load conversations");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelect = async (conv: ConversationType) => {
    const res = await fetch(`/api/conversations/${conv.id}`);
    if (!res.ok) return;
    const data = await res.json();
    setPrompt(data.prompt || "");
    if (data.stageOutputs) {
      for (const [stage, workers] of Object.entries(data.stageOutputs)) {
        for (const [worker, content] of Object.entries(workers as Record<string, string>)) {
          setStageOutput(
            stage as "research" | "reasoning" | "coding" | "final",
            worker as "worker1" | "worker2" | "worker3" | "master",
            content
          );
        }
      }
    }
    for (const stage of stageOrder) {
      const output = data.stageOutputs?.[stage]?.master;
      if (output) {
        setCurrentStageStatus(stage, "complete");
      }
    }
    if (!isDesktop) onOpenChange?.(false);
  };

  const handleNew = () => {
    clearConversation();
    if (!isDesktop) onOpenChange?.(false);
  };

  if (isDesktop) {
    return (
      <div className="fixed left-0 top-0 bottom-0 z-40 w-72 bg-surface-container-low/95 backdrop-blur-2xl border-r border-violet-500/15 pt-20 h-full hidden lg:flex flex-col">
        <SidebarContent
          conversations={conversations}
          search={search}
          setSearch={setSearch}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0 border-r border-violet-500/20 bg-surface-container-low">
        <SidebarContent
          conversations={conversations}
          search={search}
          setSearch={setSearch}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </SheetContent>
    </Sheet>
  );
}