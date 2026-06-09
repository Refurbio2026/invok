import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail, Phone } from "lucide-react";

type FooterItem = { label: string; href: string };

const aboutItems: FooterItem[] = [
  { label: "O programe", href: "/#o-programe" },
  { label: "Moduly", href: "/#moduly" },
  { label: "Pre školy", href: "/#pre-skoly" },
  { label: "Kontakt", href: "/kontakt" },
];

const usefulItems: FooterItem[] = [
  { label: "Novinky a články", href: "/novinky" },
  { label: "Testovanie kompetencií", href: "/testy" },
  { label: "Prihlásenie", href: "/prihlasenie" },
];

const legalItems: FooterItem[] = [
  { label: "Ochrana osobných údajov", href: "/ochrana-osobnych-udajov" },
  { label: "Podmienky používania", href: "/podmienky-pouzivania" },
  { label: "Vyhlásenie o prístupnosti", href: "/pristupnost" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" aria-label="INVOK">
              <Logo variant="light" />
            </Link>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              Inovatívny program rozvoja kompetencií žiakov pre 21. storočie. Národná vzdelávacia iniciatíva pre základné školy na Slovensku.
            </p>
          </div>
          <FooterCol title="O projekte" items={aboutItems} />
          <FooterCol title="Užitočné" items={usefulItems} />
          <FooterCol title="Právne" items={legalItems} />
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 grid gap-4 md:grid-cols-2 text-sm text-white/60">
          <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{"info@pscno.sk"}</span>
          <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />{"+421 905 266 681"}</span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/50">
          <span>© 2026 INVOK · Všetky práva vyhradené</span>
          <span>Projekt podporený z Programu Slovensko a Európskej únie</span>
        </div>
        <div className="mt-4 text-xs text-white/40 text-center">
          Projekt INVOK realizuje PSC n.o. – nezisková organizácia zameraná na rozvoj vzdelávania, kompetencií a príležitostí pre mladých ľudí.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: FooterItem[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-white/70">
        {items.map((i) => (
          <li key={i.label}>
            <a href={i.href} className="hover:text-white transition-colors">
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
