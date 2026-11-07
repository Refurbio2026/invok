import { cn } from "@/lib/utils";
import pscMark from "@/assets/psc-mark.png.asset.json";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const text = variant === "light" ? "text-white" : "text-foreground";
  return (
    <div className="flex items-center gap-3">
      <img
        src={pscMark.url}
        alt="PSC n.o."
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 object-contain"
      />
      <span
        className={cn("font-semibold text-2xl tracking-wide", text)}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        INVOK
      </span>
    </div>
  );
}
