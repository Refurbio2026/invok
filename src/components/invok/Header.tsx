import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#o-programe", label: "O programe" },
  { href: "#moduly", label: "Moduly" },
  { href: "#pre-skoly", label: "Pre školy" },
  { href: "#ako-to-funguje", label: "Ako to funguje" },
  { href: "#novinky", label: "Novinky" },
  { href: "#registracia", label: "Proces registrácie" },
  { href: "#kontakt", label: "Kontaktný formulár" },
  { href: "#kontaktne-udaje", label: "Kontaktné údaje" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-background/60 backdrop-blur"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <a href="#top" aria-label="INVOK"><Logo /></a>

        <nav className="hidden xl:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm">Prihlásenie</Button>
          <Button asChild size="sm" className="bg-gradient-badge text-white hover:opacity-90 shadow-soft">
            <a href="#registracia">Registrovať školu</a>
          </Button>
        </div>

        <button
          className="xl:hidden md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" className="flex-1">Prihlásenie</Button>
              <Button asChild size="sm" className="flex-1 bg-gradient-badge text-white">
                <a href="#registracia" onClick={() => setOpen(false)}>Registrovať školu</a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
