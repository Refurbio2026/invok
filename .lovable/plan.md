
## Cieľ

Plnohodnotná správa testov v `/admin/testy` — vytváranie, editor otázok, pravidlá vyhodnotenia, priraďovanie a výsledky.

## Rozsah a fázovanie

Požiadavka je rozsiahla (5+ nových tabuliek, 4–5 nových stránok, drag&drop editor, exporty). Navrhujem rozdeliť na **3 fázy**, aby si po každej vedel/a otestovať čo funguje, a aby sme nepublikovali polo-hotové veci.

---

### Fáza 1 — Dátový model + zoznam a metadáta testu

**Migrácia DB:**
- Rozšírim `tests`: pridám `slug`, `instructions`, `module_id`, `show_result_to_student`, `save_to_school_report`, `allow_retake`, `anonymous_allowed`. Typy testov rozšírim o `modulovy`, `reflexny`, `sebahodnotenie`.
- Rozšírim `test_questions`: `competency_area` (enum 6 oblastí: podnikavosť, kritické myslenie, tímová spolupráca, digitálne zručnosti, komunikácia, sebahodnotenie), `is_required`, premenujem `position` → `sort_order`, pridám `question_type` enum (`single`, `multi`, `scale_1_5`, `scale_0_10`, `open`, `yes_no`, `matching`, `ordering`).
- Nová tabuľka `test_scoring_rules` (rozsahy %, popis, label).
- Nová tabuľka `test_assignments` (test_id → school_id / class_id / grade / module_id, starts_at, ends_at, status).
- Nová tabuľka `modules` (pre prepojenie na moduly INVOK).
- Existujúce `test_attempts` a `test_answers` zachovám ako historické záznamy.

Pre každú novú tabuľku: GRANT, RLS (admin/koordinator full, škola read svojich).

**UI `/admin/testy` – zoznam:**
- Stĺpce: názov, typ, počet otázok, stav, počet priradení, dátum vytvorenia, akcie (upraviť / duplikovať / náhľad / publikovať / archivovať / vymazať).
- Filter podľa typu, stavu, ročníka.
- Tlačidlo „Vytvoriť nový test" → rozšírený formulár (názov, slug auto, typ, popis, inštrukcie, časový limit, ročník, modul, stav, prepínače: zobraziť výsledok žiakovi / uložiť do reportu / opakované vyplnenie / anonymné).
- Pri publikovaní validácia: ak test nemá otázky alebo pravidlá vyhodnotenia → upozornenie.

---

### Fáza 2 — Editor otázok + pravidlá vyhodnotenia

**`/admin/testy/$id`** dostane tabový layout:
1. **Detail** — metadáta testu, editovateľné.
2. **Otázky** — drag&drop zoznam (`@dnd-kit/sortable`), pridať / duplikovať / mazať / preskupiť. Otvorenie otázky → editor:
   - Text, typ, kompetenčná oblasť, body, povinná.
   - Pre `single` / `multi` / `yes_no` / `matching` / `ordering`: zoznam možností (text, správna, body, spätná väzba), drag&drop poradie.
   - Pre škálu: min, max, popisy hodnôt, bodovanie.
   - Pre otvorené: bez bodovania / manuálne hodnotenie / poznámka pre hodnotiteľa.
3. **Vyhodnotenie** — rozsahy bodov %, label, popis. Preddefinované 4 úrovne (0–40, 41–70, 71–90, 91–100), editovateľné. Pri kompetenčných dotazníkoch toggle „vyhodnocovať po oblastiach".
4. **Priradenie** — výber: všetkým školám / konkrétnej škole / triede / modulu / ročníku. Validity range (starts_at, ends_at).
5. **Náhľad** — render testu presne ako ho uvidí žiak (read-only verzia `TestRunner`).

---

### Fáza 3 — Výsledky a exporty

**`/admin/testy/$id` → tab „Výsledky":**
- Počet vyplnení, priemerné skóre, priemer podľa kompetenčných oblastí, výsledky po škole/triede.
- Tabuľka jednotlivých pokusov.
- Export CSV (server fn vracia CSV string, klient stiahne).
- Export PDF (server fn s `@pdfme/generator` alebo jednoduchý HTML→PDF).

---

## Technické rozhodnutia

- **DB:** všetky zmeny cez migrácie. Nové enumy: `test_type_extended`, `question_type`, `competency_area`. Migrácia rozšíri existujúce dáta.
- **Drag & drop:** `@dnd-kit/core` + `@dnd-kit/sortable` (už používané v shadcn projektoch, ľahké).
- **Server fns:** všetko cez `createServerFn` v `src/lib/admin/tests.functions.ts` (rozšírenie) + nové `assignments.functions.ts`, `results.functions.ts` (už existuje).
- **Validácia:** Zod na všetkých vstupoch.
- **Dizajn:** existujúci CRM štýl (AdminLayout, shadcn karty/tabuľky/dialógy).

## Otázka pred štartom

Mám pokračovať **celou Fázou 1 naraz** (migrácia + nový zoznam + rozšírený formulár vytvárania), potom ti odovzdám na test, a Fázy 2 a 3 spravím v ďalších krokoch?

Alebo radšej spraviť **všetko naraz** (cca 10–15 nových súborov + 1 veľká migrácia)? Riziko: ťažšie sa testuje a opravujú chyby, ale dostaneš všetko naraz.
