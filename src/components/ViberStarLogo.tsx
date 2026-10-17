"use client";
import React from "react";

interface ViberStarLogoProps {
  className?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  variant?: "badge" | "icon" | "full";
  badgeText?: string;
}

export function ViberStarLogo({
  className = "",
  size = "md",
  variant = "badge",
  badgeText,
}: ViberStarLogoProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 28
      : size === "md"
      ? 36
      : size === "lg"
      ? 48
      : 60;

  // 8-Pointed Star Rosette SVG with central cutout
  const starSvg = (
    <svg
      width={pixelSize * 0.58}
      height={pixelSize * 0.58}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M 50 5 
           L 62 26 
           L 85 15 
           L 80 40 
           L 95 62 
           L 70 70 
           L 65 95 
           L 50 78 
           L 35 95 
           L 30 70 
           L 5 62 
           L 20 40 
           L 15 15 
           L 38 26 Z"
        fill="currentColor"
      />
      {/* Central Diamond/Octagonal Cutout */}
      <polygon
        points="50,34 62,50 50,66 38,50"
        fill="#14151C"
      />
    </svg>
  );

  const badgeBox = (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-[14px] bg-[#14151C] flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.18)] border border-black/10 shrink-0 group transition-transform duration-300 hover:scale-105 ${className}`}
    >
      {starSvg}
    </div>
  );

  if (variant === "icon") {
    return badgeBox;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {badgeBox}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-headline font-extrabold tracking-[-0.03em] text-[#111827] text-lg leading-none">
            Viber
          </span>
          {badgeText && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold">
              {badgeText}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 mt-0.5 font-mono">
          INTELLIGENCE STUDIO
        </span>
      </div>
    </div>
  );
}
