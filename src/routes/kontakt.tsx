import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  Mail,
  Phone,
  Check,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt – INVOK" },
      {
        name: "description",
        content:
          "Spojte sa s tímom INVOK. Predstavenie programu, spolupráca a partnerstvá pre školy, samosprávy a organizácie.",
      },
      { property: "og:title", content: "Kontakt – INVOK" },
      {
        property: "og:description",
        content:
          "Máte záujem o predstavenie programu INVOK alebo spoluprácu? Napíšte nám.",
      },
    ],
  }),
  component: KontaktPage,
});

function KontaktPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ContactCards />
        <TeamSection />
        <SchoolFormSection />
        <PartnershipSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------ TEAM ------------------ */
function TeamSection() {
  const team = [
    {
      name: "Meno Priezvisko",
      role: "Riaditeľ programu",
      bio: "Krátky popis zamestnanca – jeho rola, skúsenosti a zameranie v rámci programu INVOK.",
    },
    {
      name: "Meno Priezvisko",
      role: "Koordinátorka škôl",
      bio: "Krátky popis zamestnanca – jeho rola, skúsenosti a zameranie v rámci programu INVOK.",
    },
    {
      name: "Meno Priezvisko",
      role: "Metodička",
      bio: "Krátky popis zamestnanca – jeho rola, skúsenosti a zameranie v rámci programu INVOK.",
    },
    {
      name: "Meno Priezvisko",
      role: "Partnerstvá a komunikácia",
      bio: "Krátky popis zamestnanca – jeho rola, skúsenosti a zameranie v rámci programu INVOK.",
    },
  ];
  return (
    <section className="py-16 md:py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Náš tím
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ľudia za programom INVOK
          </h2>
          <p className="mt-4 text-muted-foreground">
            Spoznajte tím, ktorý každý deň pracuje na rozvoji kompetencií žiakov.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <div
              key={m.name + m.role}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square w-full rounded-xl bg-muted border border-border grid place-items-center text-muted-foreground text-sm overflow-hidden mb-4">
                Foto
              </div>
              <h3 className="font-semibold text-foreground">{m.name}</h3>
              <p className="text-xs font-medium uppercase tracking-wider text-primary mt-1">
                {m.role}
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------ HERO ------------------ */
function Hero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            Kontakt
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Spojme sa
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Máte záujem o predstavenie programu INVOK, spoluprácu alebo sa
            chcete dozvedieť viac? Radi vám odpovieme.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------ CONTACT CARDS ------------------ */
function ContactCards() {
  const cards = [
    {
      I: Mail,
      label: "E-mail",
      value: "info@invok.sk",
      hint: "Odpovedáme do 2 pracovných dní",
      href: "mailto:info@invok.sk",
    },
    {
      I: Phone,
      label: "Telefón",
      value: "+421 944 239 514",
      hint: "Po – Pi · 9:00 – 17:00",
      href: "tel:+421944239514",
    },
  ];
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-lg transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                <c.I className="h-5 w-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </div>
              <a
                href={c.href}
                className="mt-1 block font-semibold text-foreground hover:text-primary transition-colors break-words"
              >
                {c.value}
              </a>
              <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------ SCHOOL FORM ------------------ */
const schoolSchema = z.object({
  skola: z.string().trim().min(2, "Zadajte názov školy").max(150),
  mesto: z.string().trim().min(2, "Zadajte mesto").max(100),
  meno: z.string().trim().min(2, "Zadajte meno").max(100),
  email: z.string().trim().email("Neplatný e-mail").max(255),
  telefon: z.string().trim().min(6, "Zadajte telefón").max(30),
  pocetZiakov: z.string().trim().min(1, "Zadajte počet žiakov").max(10),
  sprava: z.string().trim().max(1000).optional(),
});

function SchoolFormSection() {
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [d, setD] = useState({
    skola: "",
    mesto: "",
    meno: "",
    email: "",
    telefon: "",
    pocetZiakov: "",
    sprava: "",
  });

  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setD({ ...d, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schoolSchema.safeParse(d);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      toast.error("Skontrolujte prosím formulár");
      return;
    }
    setErrors({});
    setDone(true);
    toast.success("Žiadosť odoslaná");
  };

  return (
    <section className="py-16 md:py-20 bg-muted/40 border-y border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Mám záujem o predstavenie programu INVOK
          </h2>
          <p className="mt-4 text-muted-foreground">
            Vyplňte formulár a koordinátor programu vás bude kontaktovať.
          </p>
        </div>

        {done ? (
          <div className="rounded-2xl bg-card border border-border p-10 text-center shadow-soft">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 grid place-items-center mb-4">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Žiadosť odoslaná</h3>
            <p className="mt-2 text-muted-foreground">
              Ďakujeme. Ozveme sa vám do dvoch pracovných dní.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-soft grid gap-5"
            noValidate
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Názov školy *" error={errors.skola}>
                <Input value={d.skola} onChange={set("skola")} maxLength={150} />
              </Field>
              <Field label="Mesto *" error={errors.mesto}>
                <Input value={d.mesto} onChange={set("mesto")} maxLength={100} />
              </Field>
              <Field label="Meno kontaktnej osoby *" error={errors.meno}>
                <Input value={d.meno} onChange={set("meno")} maxLength={100} />
              </Field>
              <Field label="E-mail *" error={errors.email}>
                <Input
                  type="email"
                  value={d.email}
                  onChange={set("email")}
                  maxLength={255}
                />
              </Field>
              <Field label="Telefón *" error={errors.telefon}>
                <Input
                  type="tel"
                  value={d.telefon}
                  onChange={set("telefon")}
                  maxLength={30}
                />
              </Field>
              <Field label="Počet žiakov *" error={errors.pocetZiakov}>
                <Input
                  type="number"
                  min={1}
                  value={d.pocetZiakov}
                  onChange={set("pocetZiakov")}
                  maxLength={10}
                />
              </Field>
            </div>
            <Field label="Správa" error={errors.sprava}>
              <Textarea
                rows={5}
                value={d.sprava}
                onChange={set("sprava")}
                maxLength={1000}
                placeholder="Doplňujúce informácie alebo otázky"
              />
            </Field>
            <Button
              type="submit"
              size="lg"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 justify-self-start px-6"
            >
              Odoslať žiadosť <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ------------------ PARTNERSHIPS ------------------ */
function PartnershipSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Partnerstvá a spolupráca
        </h2>
        <p className="mt-5 text-muted-foreground max-w-2xl mx-auto">
          Spolupracujeme s organizáciami, samosprávami, nadáciami aj firmami,
          ktoré chcú prispieť k rozvoju kompetencií žiakov na Slovensku.
          Otvorení sme novým partnerstvám, mediálnej spolupráci aj spoločným
          projektom.
        </p>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="mt-8 rounded-full"
        >
          <a href="mailto:partneri@invok.sk">
            Kontaktovať tím INVOK <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}


/* ------------------ FAQ ------------------ */
function FaqSection() {
  const items = [
    {
      q: "Ako sa môže škola zapojiť?",
      a: "Stačí vyplniť formulár vyššie alebo nás kontaktovať e-mailom. Koordinátor programu vám predstaví možnosti zapojenia a navrhne harmonogram.",
    },
    {
      q: "Koľko stojí program?",
      a: "Pre pilotné a partnerské školy je program v rámci aktuálnej výzvy bezplatný. Konkrétne podmienky závisia od typu zapojenia a počtu žiakov.",
    },
    {
      q: "Pre ktoré ročníky je určený?",
      a: "Program je určený pre žiakov 8 a 9 ročníka ZŠ.",
    },
    {
      q: "Ako funguje testovanie kompetencií?",
      a: "Žiaci absolvujú vstupný a výstupný kompetenčný dotazník. Výsledky sa zobrazujú formou prehľadného profilu kompetencií. Viac informácií nájdete na stránke Testovanie.",
    },
    {
      q: "Kedy je možné program spustiť?",
      a: "Nové školy zaraďujeme priebežne na začiatku každého polroka. Konkrétny termín určíme spoločne podľa vašich kapacít.",
    },
  ];
  return (
    <section className="py-16 md:py-20 bg-muted/40 border-t border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
          Často kladené otázky
        </h2>
        <div className="mt-10 space-y-3">
          {items.map((it) => (
            <details
              key={it.q}
              className="group rounded-xl border border-border bg-card p-5 shadow-soft"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold">
                {it.q}
                <span className="text-primary text-xl group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {it.a}
              </p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="link">
            <Link to="/testy">Pozrieť stránku Testovanie →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
