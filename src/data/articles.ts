export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO
  author: string;
  excerpt: string;
  image: string;
  content: string[]; // paragraphs
};

export const CATEGORIES = [
  "Aktuality",
  "Zo škôl",
  "Kompetencie",
  "Kritické myslenie",
  "Mediálna gramotnosť",
  "Podnikavosť",
  "Digitálne zručnosti",
  "Tímová spolupráca",
] as const;

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=70`;

export const ARTICLES: Article[] = [
  {
    slug: "preco-skoly-potrebuju-kompetencie-21-storocia",
    title: "Prečo školy potrebujú rozvíjať kompetencie pre 21. storočie",
    category: "Kompetencie",
    date: "2026-05-20",
    author: "Tím INVOK",
    excerpt:
      "Svet sa mení rýchlejšie než kedykoľvek predtým. Vysvetľujeme, prečo sú kompetencie ako kritické myslenie, podnikavosť a spolupráca dnes dôležitejšie než memorovanie faktov.",
    image: img("photo-1523240795612-9a054b0db644"),
    content: [
      "Tradičný model vzdelávania, ktorý sa zameriaval na zapamätanie veľkého množstva informácií, prestáva zodpovedať potrebám doby. Žiaci dnes vstupujú do sveta, v ktorom sa technológie, povolania aj spoločenské normy menia rýchlejšie, než stihne učebnica zostarnúť.",
      "Program INVOK preto stavia na rozvoji prierezových kompetencií – kritického myslenia, podnikavosti, digitálnej a mediálnej gramotnosti, tímovej spolupráce a komunikácie. Práve tieto schopnosti sú podľa OECD a Európskej komisie kľúčové pre úspech v 21. storočí.",
      "Školy, ktoré sa zapoja do programu, získajú nielen metodickú podporu, ale aj nástroje na merateľné vyhodnocovanie pokroku žiakov v jednotlivých kompetenciách.",
    ],
  },
  {
    slug: "ako-merat-pokrok-ziakov-kompetencnymi-testami",
    title: "Ako merať pokrok žiakov pomocou kompetenčných testov",
    category: "Aktuality",
    date: "2026-05-12",
    author: "Tím INVOK",
    excerpt:
      "Vstupné a výstupné testovanie umožňuje školám objektívne sledovať rozvoj žiakov. Ukazujeme, ako celý proces funguje a aké dáta z neho získate.",
    image: img("photo-1454165804606-c3d57bc86b40"),
    content: [
      "Meranie kompetencií je jednou z najdôležitejších inovácií, ktorú INVOK prináša do slovenských škôl. Žiaci absolvujú vstupný kompetenčný dotazník pred začiatkom programu a výstupný po jeho ukončení.",
      "Výsledky sa zobrazujú vo forme prehľadného profilu kompetencií, ktorý umožňuje porovnanie pred a po programe. Učitelia a vedenie školy získajú agregované reporty, žiaci individuálnu spätnú väzbu.",
      "Vďaka tomu môžu školy objektívne vyhodnotiť, v ktorých oblastiach žiaci najviac napredovali a kam smerovať ďalšiu pedagogickú pozornosť.",
    ],
  },
  {
    slug: "kriticke-myslenie-ochrana-pred-manipulaciou",
    title: "Kritické myslenie ako ochrana pred manipuláciou",
    category: "Kritické myslenie",
    date: "2026-05-04",
    author: "Tím INVOK",
    excerpt:
      "V dobe dezinformácií, hoaxov a generatívnej AI je kritické myslenie kľúčovou zručnosťou. Ako ho učíme v programe INVOK?",
    image: img("photo-1495020689067-958852a7765e"),
    content: [
      "Žiaci sú dnes vystavení obrovskému množstvu informácií, ktorých kvalitu a pravdivosť je čoraz ťažšie posúdiť. Generatívna AI navyše umožňuje vytvárať dôveryhodne pôsobiaci, no zavádzajúci obsah v sekundách.",
      "Modul Kritické myslenie v programe INVOK učí žiakov rozpoznávať manipulatívne techniky, overovať zdroje, rozlišovať fakt od názoru a klásť správne otázky.",
      "Praktické aktivity zahŕňajú analýzu reálnych článkov, simulácie diskusií a prácu s prípadovými štúdiami zo súčasných médií.",
    ],
  },
  {
    slug: "co-prinasa-ziakom-projektove-ucenie",
    title: "Čo prináša žiakom projektové učenie",
    category: "Kompetencie",
    date: "2026-04-22",
    author: "Tím INVOK",
    excerpt:
      "Projektové učenie spája teóriu s praxou. Pozrite sa, ako pomáha žiakom rozvíjať tímovú spoluprácu, zodpovednosť a tvorivosť.",
    image: img("photo-1531482615713-2afd69097998"),
    content: [
      "Projektové učenie je metóda, pri ktorej žiaci pracujú na konkrétnom probléme alebo zadaní v tíme počas dlhšieho obdobia. Učia sa tým plánovať, rozdeľovať úlohy, prezentovať výsledky a niesť zodpovednosť za spoločné dielo.",
      "V programe INVOK je projektové učenie základným kameňom – každý modul končí projektovou kartou, ktorú žiaci spracujú a prezentujú pred triedou alebo pred porotou.",
      "Učitelia oceňujú najmä to, že žiaci sú v projektovej fáze výrazne motivovanejší a aktívnejší než pri klasickom výklade.",
    ],
  },
  {
    slug: "prve-skusenosti-skol-zapojenych-do-invok",
    title: "Prvé skúsenosti škôl zapojených do programu INVOK",
    category: "Zo škôl",
    date: "2026-04-10",
    author: "Tím INVOK",
    excerpt:
      "Pýtali sme sa pilotných škôl, ako vnímajú prvé mesiace programu. Prinášame ich postrehy, výsledky aj odporúčania pre nové školy.",
    image: img("photo-1577896851231-70ef18881754"),
    content: [
      "Do pilotnej fázy programu INVOK sa zapojilo desať základných a stredných škôl z rôznych regiónov Slovenska. Po prvých mesiacoch sme zozbierali ich spätnú väzbu.",
      "Učitelia oceňujú najmä prepracované metodické materiály, jasnú štruktúru modulov a interaktívne aktivity, ktoré žiakov skutočne bavia. Riaditelia škôl vyzdvihujú prehľadné reporty a možnosť merať konkrétny pokrok.",
      "Najčastejšie odporúčanie pre nové školy: začnite jedným modulom v jednej triede, získajte skúsenosť, a potom program rozšírte na celú školu.",
    ],
  },
  {
    slug: "ako-budujeme-podnikavost-u-mladych-ludi",
    title: "Ako budujeme podnikavosť u mladých ľudí",
    category: "Podnikavosť",
    date: "2026-03-28",
    author: "Tím INVOK",
    excerpt:
      "Podnikavosť nie je len o zakladaní firiem. Je to schopnosť vidieť príležitosti, prevziať iniciatívu a doviesť nápad do konca. Ako ju rozvíjame v INVOK?",
    image: img("photo-1552664730-d307ca884978"),
    content: [
      "Podnikavosť je v širšom zmysle životný postoj – schopnosť rozpoznať problém, navrhnúť riešenie a doviesť ho do reálnej podoby. Týka sa rovnako budúceho zamestnanca, učiteľa, ako aj zakladateľa firmy.",
      "Modul Inovátor školy učí žiakov nájsť konkrétny problém vo svojom okolí, navrhnúť riešenie, otestovať ho a odprezentovať pred publikom. Žiaci pracujú s nástrojmi, ako sú lean canvas, prototyp a pitch.",
      "Výstupom modulu je reálny mini-projekt, ktorý mnohé školy následne implementujú do svojej praxe.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string, limit = 3): Article[] {
  const current = getArticle(slug);
  if (!current) return [];
  return ARTICLES.filter(
    (a) => a.slug !== slug && a.category === current.category
  )
    .concat(ARTICLES.filter((a) => a.slug !== slug && a.category !== current.category))
    .slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
