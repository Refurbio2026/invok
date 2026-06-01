import { cn } from "@/lib/utils";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const text = variant === "light" ? "text-white" : "text-foreground";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 rounded-full bg-gradient-badge shadow-soft grid place-items-center">
        <span className="text-white font-extrabold text-sm tracking-tight">IN</span>
      </div>
      <span className={cn("font-extrabold text-2xl tracking-tight", text)}>INVOK</span>
    </div>
  );
}
