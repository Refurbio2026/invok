export type CompetencyKey =
  | "podnikavost"
  | "kriticke"
  | "timova"
  | "digitalne"
  | "komunikacia"
  | "sebahodnotenie";

export const COMPETENCIES: { key: CompetencyKey; label: string; short: string; desc: string }[] = [
  { key: "podnikavost", label: "Podnikavosť a iniciatíva", short: "Podnikavosť", desc: "Schopnosť identifikovať problémy, navrhovať riešenia a prevziať iniciatívu." },
  { key: "kriticke", label: "Kritické a mediálne myslenie", short: "Kritické myslenie", desc: "Práca s informáciami, overovanie zdrojov a odhaľovanie manipulácií." },
  { key: "timova", label: "Tímová spolupráca", short: "Tímová spolupráca", desc: "Komunikácia, spolupráca a zodpovednosť pri práci v skupine." },
  { key: "digitalne", label: "Digitálne zručnosti", short: "Digitálne zručnosti", desc: "Bezpečné a efektívne využívanie digitálnych technológií." },
  { key: "komunikacia", label: "Komunikácia a prezentácia", short: "Komunikácia", desc: "Vyjadrovanie názorov, argumentácia a prezentovanie myšlienok." },
  { key: "sebahodnotenie", label: "Sebahodnotenie a budúcnosť", short: "Sebahodnotenie", desc: "Sebareflexia, motivácia a plánovanie vlastného rozvoja." },
];

// Each competency: 8 Likert items × 5 = max 40 b. Total scored max = 240, otvorené hodnotí učiteľ.
const ITEMS_PER_COMP = 8;
export const MAX_PER_COMP = ITEMS_PER_COMP * 5;

const STEM: Record<CompetencyKey, string[]> = {
  podnikavost: [
    "Keď vidím vo svojom okolí problém, premýšľam, ako ho vyriešiť.",
    "Neváham prísť s vlastným nápadom, aj keď nie je dokonalý.",
    "Dokážem rozdeliť veľký nápad na menšie kroky.",
    "Som ochotný/á niesť zodpovednosť za výsledok projektu.",
    "Hľadám príležitosti zlepšiť veci okolo seba.",
    "Aj pri neúspechu sa pokúsim nájsť ďalšie riešenie.",
    "Vyhľadávam spätnú väzbu, aby som svoj nápad zlepšil/a.",
    "Plánujem dopredu a stanovujem si reálne ciele.",
  ],
  kriticke: [
    "Pred zdieľaním informácie si overím, či je pravdivá.",
    "Rozlišujem fakt od názoru.",
    "Pri tvrdení hľadám dôkazy, ktoré ho podporujú alebo vyvracajú.",
    "Viem si všimnúť manipulatívne titulky a obrázky.",
    "Pri rozhodovaní zvažujem rôzne pohľady.",
    "Som ochotný/á zmeniť názor, keď zistím nové fakty.",
    "Porovnávam informácie z viacerých zdrojov.",
    "Rozpoznám reklamu a sponzorovaný obsah od bežného obsahu.",
  ],
  timova: [
    "V tíme rád/rada počúvam ostatných.",
    "Viem prijať rolu, ktorá nie je hlavná, ak je potrebná.",
    "Pri konflikte hľadám riešenie, nie vinníka.",
    "Dodržiavam dohody, na ktorých sa tím dohodol.",
    "Pomôžem spolužiakovi, ktorý nestíha.",
    "Vyjadrím svoj názor aj keď nesúhlasím s väčšinou.",
    "Dokážem rozdeliť úlohy podľa silných stránok členov.",
    "Rešpektujem rôzne názory a štýly práce.",
  ],
  digitalne: [
    "Viem si zorganizovať súbory a poznámky na zariadení.",
    "Používam silné a rôzne heslá pre rôzne služby.",
    "Viem zistiť, či je webová stránka dôveryhodná.",
    "Viem spolupracovať na zdieľanom dokumente online.",
    "Rozumiem rizikám zdieľania osobných údajov.",
    "Viem efektívne vyhľadávať informácie na internete.",
    "Používam digitálne nástroje na učenie (kalendár, poznámky, plány).",
    "Viem rozpoznať podozrivý e-mail alebo správu.",
  ],
  komunikacia: [
    "Viem zrozumiteľne vysvetliť svoj nápad spolužiakom.",
    "Pri prezentácii zvládam udržať očný kontakt.",
    "Pripravím si štruktúru prezentácie pred jej prednesom.",
    "Viem reagovať na otázky publika bez výrazného stresu.",
    "Aktívne počúvam, kým druhý hovorí.",
    "Vyjadrujem sa slušne aj pri nezhode.",
    "Prispôsobím spôsob vyjadrovania publiku.",
    "Argumentujem faktami, nie len pocitmi.",
  ],
  sebahodnotenie: [
    "Viem pomenovať svoje silné stránky.",
    "Viem pomenovať oblasti, v ktorých sa potrebujem zlepšiť.",
    "Stanovujem si vlastné ciele a sledujem ich plnenie.",
    "Z chýb sa snažím poučiť, nie ich skrývať.",
    "Viem požiadať o pomoc, keď ju potrebujem.",
    "Premýšľam o tom, čo chcem robiť po skončení školy.",
    "Plánujem si čas tak, aby som stíhal/a školu aj záľuby.",
    "Viem, prečo sa učím konkrétny predmet.",
  ],
};

export type LikertItem = { id: string; competency: CompetencyKey; text: string };

export const SCORED_ITEMS: LikertItem[] = COMPETENCIES.flatMap((c) =>
  STEM[c.key].map((text, i) => ({ id: `${c.key}-${i}`, competency: c.key, text }))
);

export const OPEN_QUESTIONS = [
  "Opíš situáciu, v ktorej si v tíme priniesol/a vlastný nápad. Ako reagovali ostatní?",
  "Spomenieš si na informáciu z internetu, ktorá sa ti zdala podozrivá? Ako si si ju overil/a?",
  "Ktorá kompetencia ti v škole najviac chýba a prečo?",
  "Aký krok urobíš v najbližšom polroku, aby si sa v jednej z týchto oblastí zlepšil/a?",
];

export const TOTAL_QUESTIONS = SCORED_ITEMS.length + OPEN_QUESTIONS.length; // 48 + 4
