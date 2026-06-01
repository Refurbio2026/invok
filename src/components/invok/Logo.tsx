import { cn } from "@/lib/utils";

export function Logo({ variant = "dark", showTagline = true }: { variant?: "dark" | "light"; showTagline?: boolean }) {
  const text = variant === "light" ? "text-white" : "text-foreground";
  const tagline = variant === "light" ? "text-white/70" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 rounded-2xl bg-gradient-badge shadow-soft grid place-items-center">
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-white" fill="none">
          <circle cx="7" cy="24" r="2.4" fill="currentColor" />
          <circle cx="16" cy="16" r="2.4" fill="currentColor" />
          <circle cx="25" cy="8" r="2.4" fill="currentColor" />
          <path d="M7 24 L16 16 L25 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M21 8 L25 8 L25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-extrabold text-xl tracking-tight", text)}>INVOK</span>
        {showTagline && (
          <span className={cn("text-[10px] font-medium mt-1 uppercase tracking-wider", tagline)}>
            Kompetencie pre budúcnosť
          </span>
        )}
      </div>
    </div>
  );
}
