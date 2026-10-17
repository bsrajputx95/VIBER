"use client";
import React from "react";

interface ViberLogoProps {
  className?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  variant?: "icon" | "full";
  badge?: string;
}

export function ViberLogo({
  className = "",
  size = "md",
  animated = true,
  variant = "full",
  badge = "SYNAPTIC AI",
}: ViberLogoProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 28
      : size === "md"
      ? 36
      : size === "lg"
      ? 48
      : 64;

  const iconMarkup = (
    <div
      className={`relative flex items-center justify-center shrink-0 ${
        animated ? "group" : ""
      }`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Ambient Glow */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600/40 via-cyan-500/20 to-amber-500/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ transform: "scale(1.15)" }}
      />

      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 transition-transform duration-500 ${
          animated ? "group-hover:scale-105" : ""
        }`}
      >
        <defs>
          {/* Main Synaptic Liquid Iridescent Gradient */}
          <linearGradient id="viberSynapticGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="65%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#FF7A00" />
          </linearGradient>

          {/* Molten Amber Glow Accent */}
          <linearGradient id="viberAmberGrad" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFAE33" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF5500" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
          </linearGradient>

          {/* Chrome Specular Sheen */}
          <linearGradient id="viberChromeGloss" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFAE33" stopOpacity="0.3" />
          </linearGradient>

          {/* Deep Core Shadow */}
          <radialGradient id="viberCoreShadow" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="70%" stopColor="#0A0D24" stopOpacity="0" />
            <stop offset="100%" stopColor="#050716" stopOpacity="0.75" />
          </radialGradient>

          <filter id="viberDropGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7C3AED" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer 4-Lobed Synaptic Clover Body */}
        <g filter="url(#viberDropGlow)">
          {/* Connecting Bridges (X-cross arms) */}
          <path
            d="M 34 34 L 66 66 M 66 34 L 34 66"
            stroke="url(#viberSynapticGrad)"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Center Junction Node */}
          <circle cx="50" cy="50" r="13" fill="url(#viberAmberGrad)" />

          {/* 4 Outer Rings */}
          {/* Top-Left Ring */}
          <circle cx="32" cy="32" r="16" fill="url(#viberSynapticGrad)" />
          {/* Top-Right Ring */}
          <circle cx="68" cy="32" r="16" fill="url(#viberSynapticGrad)" />
          {/* Bottom-Left Ring */}
          <circle cx="32" cy="68" r="16" fill="url(#viberAmberGrad)" />
          {/* Bottom-Right Ring */}
          <circle cx="68" cy="68" r="16" fill="url(#viberSynapticGrad)" />

          {/* Inner Torus Cutouts */}
          <circle cx="32" cy="32" r="7.5" fill="#070814" />
          <circle cx="68" cy="32" r="7.5" fill="#070814" />
          <circle cx="32" cy="68" r="7.5" fill="#070814" />
          <circle cx="68" cy="68" r="7.5" fill="#070814" />

          {/* Inner Core Rings for Technical Grid Look */}
          <circle cx="32" cy="32" r="7.5" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1" fill="none" />
          <circle cx="68" cy="32" r="7.5" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1" fill="none" />
          <circle cx="32" cy="68" r="7.5" stroke="rgba(255, 122, 0, 0.6)" strokeWidth="1" fill="none" />
          <circle cx="68" cy="68" r="7.5" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1" fill="none" />

          {/* Center Core Micro Dot */}
          <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" opacity="0.9" />

          {/* Specular Highlight Overlay */}
          <path
            d="M 24 24 Q 50 16 76 24 M 20 50 Q 50 42 80 50"
            stroke="url(#viberChromeGloss)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>
      </svg>
    </div>
  );

  if (variant === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{iconMarkup}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {iconMarkup}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-headline font-black tracking-[-0.04em] text-white text-lg md:text-xl leading-none">
            VIBER
          </span>
          {badge && (
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-amber-500/20 border border-violet-400/30 text-violet-300">
              {badge}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-[0.28em] text-cyan-400/80 font-bold mt-0.5 font-mono">
          NEURAL PIPELINE
        </span>
      </div>
    </div>
  );
}
