import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import pscMark from "@/assets/psc-mark.png.asset.json";

type NavLink = { href: string; label: string };

const links: NavLink[] = [
  { href: "/#o-programe", label: "O programe" },
  { href: "/#moduly", label: "Moduly" },
  { href: "/#pre-skoly", label: "Pre školy" },
  { href: "/testy", label: "Testovanie" },
  { href: "/novinky", label: "Novinky" },
  { href: "/kontakt", label: "Kontakt" },
];

function NavItem({
  link,
  mobile = false,
  onClick,
}: {
  link: NavLink;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const base = mobile
    ? "px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted block"
    : "text-sm font-medium text-foreground/80 hover:text-primary transition-colors";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const hashIdx = link.href.indexOf("#");
    if (hashIdx !== -1) {
      const targetPath = link.href.slice(0, hashIdx) || "/";
      const targetId = link.href.slice(hashIdx + 1);
      const currentPath = window.location.pathname;
      if (currentPath === targetPath || (targetPath === "/" && currentPath === "/")) {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
          const headerOffset = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
          const html = document.documentElement;
          const previousScrollBehavior = html.style.scrollBehavior;
          html.style.scrollBehavior = "auto";
          window.scrollTo(0, top);
          html.style.scrollBehavior = previousScrollBehavior;
          history.replaceState(null, "", `#${targetId}`);
        }
        onClick?.();
        return;
      }
    }
    onClick?.();
  };

  return (
    <a href={link.href} className={base} onClick={handleClick}>
      {link.label}
    </a>
  );
}

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
        "sticky top-0 z-50 transition-all bg-background",
        scrolled ? "border-b border-border shadow-soft" : ""
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" aria-label="INVOK – PSC n.o." className="flex shrink-0 items-center gap-3">
          <Logo />
          <img src={pscMark.url} alt="PSC n.o." width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {links.map((l) => (
            <NavItem key={l.href} link={l} />
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href="/prihlasenie"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Prihlásenie
          </a>
          <Button asChild size="sm">
            <Link to="/registracia-skoly">Registrovať školu</Link>
          </Button>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavItem
                key={l.href}
                link={l}
                mobile
                onClick={() => setOpen(false)}
              />
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button asChild variant="ghost" size="sm" className="flex-1">
                <a href="/prihlasenie" onClick={() => setOpen(false)}>
                  Prihlásenie
                </a>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to="/registracia-skoly" onClick={() => setOpen(false)}>
                  Registrovať školu
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
