# INVOK – web a vzdelávacia platforma

Web a aplikácia národného programu **INVOK – Inovatívny program rozvoja kompetencií žiakov** pre žiakov 8. a 9. ročníka základných škôl. Obsahuje verejný web (o programe, novinky, registrácia školy, kontakt) a prihlásené prostredia pre administrátora, školu, učiteľa a žiaka.

Projekt je spravovaný cez [Lovable](https://lovable.dev); pôvodný zadávací prompt webu je v [`docs/lovable-prompt.md`](docs/lovable-prompt.md).

## Technológie

- **TanStack Start** (React 19, server functions, file-based routing) + **Vite 7**
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI)
- **Supabase** – autentifikácia, Postgres, Row Level Security
- **Drizzle** – SQL migrácie (`drizzle/`)
- TanStack Query, React Hook Form + Zod, Recharts, jsPDF (PDF reporty), TipTap (editor blogu), Resend (e-maily)
- Balíčkový manažér: **Bun** (`bun.lock`)

## Spustenie

```bash
bun install
bun run dev        # vývojový server
bun run build      # produkčný build
bun run preview    # náhľad buildu
bun run lint       # ESLint
bun run format     # Prettier
bun test           # unit testy (bun:test)
```

> `bunfig.toml` obsahuje ochranu dodávateľského reťazca – neinštaluje verzie balíčkov mladšie ako 24 hodín.

## Premenné prostredia

Verejné hodnoty sú v `.env` (publishable kľúč Supabase, nie tajomstvo):

| Premenná | Použitie |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | klient v prehliadači |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | server |

Tajné hodnoty sa **nikdy necommitujú** – nastavujú sa v prostredí (Lovable / hosting):

| Premenná | Použitie |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | admin klient na serveri (`client.server.ts`) |
| `RESEND_API_KEY` | odosielanie e-mailov |
| `LOVABLE_API_KEY`, `LOVABLE_SEND_URL` | e-mailová fronta Lovable |
| `LOVABLE_DB_MIGRATION_URL` | Drizzle migrácie |

## Štruktúra

```
src/
  routes/                 file-based routing (pozri src/routes/README.md)
    index.tsx, novinky.*, kontakt.tsx, registracia-skoly.tsx, testy.*   verejný web
    *.prihlasenie.tsx     prihlásenie (admin, škola, učiteľ, žiak)
    _authenticated/       chránené stránky: admin.*, skola.*, ucitel.*
    ziak.*                prostredie žiaka (kód + PIN)
    api/public/           verejné API (žiadosť o registráciu školy)
  lib/
    admin/                server functions administrácie
    school/               server functions a pravidlá školy
    teacher/              server functions učiteľa
    public/               žiak a verejné formuláre
    learning/             zdieľané čisté pravidlá prístupu k testom
  components/invok/       komponenty webu a pracovných prostredí
  components/ui/          shadcn/ui
  integrations/supabase/  klienti, auth middleware, typy DB
drizzle/                  schéma a migrácie
supabase/                 konfigurácia a migrácie Supabase
```

## Roly a oprávnenia

| Rola | Prístup |
| --- | --- |
| **Admin** | školy, žiadosti o registráciu, používatelia, triedy, žiaci, testy, výsledky, reporty, blog, galéria, videá |
| **Škola** | profil školy, triedy, priradenie existujúcich učiteľov k triedam, výsledky a reporty |
| **Učiteľ** | iba triedy priradené jeho používateľovi – žiaci, priradenie testov, moduly, výsledky triedy |
| **Žiak** | dostupné testy, moduly a vlastné výsledky (podľa pravidiel viditeľnosti) |

Zásady (podrobne v [`AGENTS.md`](AGENTS.md)):

- Škola sa odvodzuje z profilu prihláseného používateľa, nikdy zo vstupu požiadavky.
- Operácie školy a učiteľa idú cez autentifikovaného klienta a RLS, nie cez service-role klienta.
- Učiteľské účty zakladá centrálne admin; škola ich len priraďuje k triedam.
- Žiak sa overuje kódom a PIN-om pri každej serverovej operácii. Dostupnosť testu, pokusy, otázky a viditeľnosť výsledkov sa kontrolujú na serveri pomocou zdieľaných pravidiel v `src/lib/learning/permissions.ts` a `src/lib/school/rules.ts` (pokryté testami).

## Databáza

- Migrácie Supabase: `supabase/migrations/`
- Migrácie Drizzle (RLS politiky, ochrana kľúča odpovedí, zákaz duplicitných otvorených pokusov): `drizzle/migrations/`
- Typy databázy: `src/integrations/supabase/types.ts`

## Poznámky

- `src/routeTree.gen.ts` sa generuje automaticky – needitovať ručne.
- Súbory v `.lovable/` spravuje Lovable.
