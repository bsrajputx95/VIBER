"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [bg3dDisabled, setBg3dDisabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("viber-theme");
    const dark = stored !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    setBg3dDisabled(localStorage.getItem("viber-3d-disabled") === "true");
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("viber-theme", newIsDark ? "dark" : "light");
  };

  if (isDark === null) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/5"
          aria-label="Theme and settings"
        >
          <span className="material-symbols-outlined text-base">
            {isDark ? "dark_mode" : "light_mode"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-surface-container border-violet-500/20 text-slate-200">
        <DropdownMenuCheckboxItem
          checked={!isDark}
          onCheckedChange={toggle}
          className="text-xs cursor-pointer focus:bg-violet-600/20"
        >
          Light mode
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        <DropdownMenuCheckboxItem
          checked={bg3dDisabled}
          onCheckedChange={(v) => {
            localStorage.setItem("viber-3d-disabled", v ? "true" : "");
            setBg3dDisabled(v);
            window.location.reload();
          }}
          className="text-xs cursor-pointer focus:bg-violet-600/20"
        >
          Disable 3D visualizer
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}