import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { ViberLogo } from "@/components/ViberLogo";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background synaptic-grid relative overflow-hidden px-4">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 blur-[100px] pointer-events-none" />

      <div className="flex flex-col items-center gap-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <ViberLogo size="lg" variant="full" badge="SYNAPTIC" />
          <p className="text-xs font-mono text-slate-400">
            Synaptic Multi-Agent Neural Synthesis Platform
          </p>
        </div>

        <div className="w-full glass-panel synaptic-gradient-border rounded-3xl p-6 shadow-2xl border border-violet-500/20">
          <AuthForm />
        </div>

        <Link
          href="/"
          className="text-xs font-mono text-violet-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>←</span> Return to Neural Dashboard
        </Link>
      </div>
    </div>
  );
}
