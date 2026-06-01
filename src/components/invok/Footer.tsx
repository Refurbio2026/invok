import { Logo } from "./Logo";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo variant="light" />
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              Inovatívny program rozvoja kompetencií žiakov pre 21. storočie. Národná vzdelávacia iniciatíva pre základné školy na Slovensku.
            </p>
          </div>
          <FooterCol title="O projekte" items={["O programe", "Moduly", "Pre školy", "Pre učiteľov", "Pre žiakov"]} />
          <FooterCol title="Užitočné" items={["Novinky a články", "Časté otázky", "Partneri projektu", "Kontakt"]} />
          <FooterCol title="Právne" items={["Ochrana osobných údajov", "GDPR", "Podmienky používania", "Vyhlásenie o prístupnosti"]} />
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 grid gap-4 md:grid-cols-3 text-sm text-white/60">
          <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> info@invok.sk</span>
          <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +421 900 000 000</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Hlavná 1, 811 01 Bratislava</span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/50">
          <span>© 2026 INVOK · Všetky práva vyhradené</span>
          <span>Projekt podporený z Programu Slovensko a Európskej únie</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-white/70">
        {items.map((i) => (
          <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>
        ))}
      </ul>
    </div>
  );
}
