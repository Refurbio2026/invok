import { cn } from "@/lib/utils";
import { setLangCookie, useLang, type Lang } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const lang = useLang();
  const change = (next: Lang) => {
    if (next === lang) return;
    setLangCookie(next);
    window.location.reload();
  };
  return (
    <div className={cn("inline-flex rounded-full border border-border p-0.5 text-xs font-semibold", className)} role="group" aria-label="Jazyk / Nyelv">
      {(["sk", "hu"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
