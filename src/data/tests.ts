export type ScoredQuestion = {
  q: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correct: "A" | "B" | "C" | "D";
};

export type ScoredTest = {
  kind: "scored";
  slug: string;
  title: string;
  description: string;
  questions: ScoredQuestion[];
  evaluation: { range: [number, number]; level: string; text: string }[];
};

export type PersonalityQuestion = {
  q: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
};

export type PersonalityTest = {
  kind: "personality";
  slug: string;
  title: string;
  description: string;
  questions: PersonalityQuestion[];
  profiles: Record<"A" | "B" | "C" | "D", { name: string; strength: string }>;
};

export type TestDef = ScoredTest | PersonalityTest;

const scoredEval = (basic: string, good: string, excellent: string) => [
  { range: [0, 2] as [number, number], level: "Základná úroveň", text: basic },
  { range: [3, 4] as [number, number], level: "Dobrá úroveň", text: good },
  { range: [5, 5] as [number, number], level: "Výborná úroveň", text: excellent },
];

export const TESTS: Record<string, TestDef> = {
  "kriticke-myslenie": {
    kind: "scored",
    slug: "kriticke-myslenie",
    title: "Kritické myslenie",
    description: "Práca s informáciami, argumentácia a rozhodovanie.",
    questions: [
      {
        q: "Na internete nájdeš článok s výrazným titulkom: „Táto metóda učenia zaručí samé jednotky za 7 dní.“ Čo urobíš ako prvé?",
        options: [
          { key: "A", text: "Okamžite ju odporučím spolužiakom." },
          { key: "B", text: "Overím si autora, zdroje a porovnám informácie s ďalšími dôveryhodnými zdrojmi." },
          { key: "C", text: "Uverím tomu, lebo titulok znie presvedčivo." },
          { key: "D", text: "Budem to ignorovať bez ďalšieho premýšľania." },
        ],
        correct: "B",
      },
      {
        q: "Dvaja spolužiaci tvrdia opačné veci o jednej udalosti. Čo je najrozumnejší postup?",
        options: [
          { key: "A", text: "Veriť tomu, kto hovorí sebavedomejšie." },
          { key: "B", text: "Opýtať sa na dôkazy a zistiť viac informácií z viacerých strán." },
          { key: "C", text: "Rozhodnúť podľa toho, koho mám radšej." },
          { key: "D", text: "Nechať to tak, pravda sa nedá zistiť." },
        ],
        correct: "B",
      },
      {
        q: "Pri skupinovej práci niekto navrhne riešenie, ktoré znie dobre, ale nikto nevie, či funguje. Čo urobíš?",
        options: [
          { key: "A", text: "Prijmem ho, aby sme nestrácali čas." },
          { key: "B", text: "Navrhnem, aby sme si overili, či riešenie skutočne rieši problém." },
          { key: "C", text: "Odmietnem ho bez vysvetlenia." },
          { key: "D", text: "Počkám, kým rozhodne učiteľ." },
        ],
        correct: "B",
      },
      {
        q: "Na sociálnej sieti vidíš informáciu, ktorú zdieľalo veľa ľudí. Čo to znamená?",
        options: [
          { key: "A", text: "Určite je pravdivá." },
          { key: "B", text: "Je populárna, ale stále si vyžaduje overenie." },
          { key: "C", text: "Určite je nepravdivá." },
          { key: "D", text: "Netreba sa tým zaoberať." },
        ],
        correct: "B",
      },
      {
        q: "Ak máš rozhodnúť medzi dvoma možnosťami, čo ti najviac pomôže?",
        options: [
          { key: "A", text: "Vybrať si tú, ktorá je jednoduchšia." },
          { key: "B", text: "Porovnať výhody, riziká a dostupné informácie." },
          { key: "C", text: "Vybrať si podľa nálady." },
          { key: "D", text: "Nechať rozhodnutie na niekoho iného." },
        ],
        correct: "B",
      },
    ],
    evaluation: scoredEval(
      "Odporúčanie: pracovať na overovaní informácií a rozpoznávaní argumentov.",
      "Odporúčanie: ďalej rozvíjať prácu s dôkazmi a formulovanie vlastného názoru.",
      "Silná stránka: analytické uvažovanie, overovanie zdrojov a zodpovedné rozhodovanie.",
    ),
  },
  "komunikacne-zrucnosti": {
    kind: "scored",
    slug: "komunikacne-zrucnosti",
    title: "Komunikačné zručnosti",
    description: "Situácie z bežného života a medziľudskej komunikácie.",
    questions: [
      {
        q: "Spolužiak nesúhlasí s tvojím názorom. Ako zareaguješ najlepšie?",
        options: [
          { key: "A", text: "Preruším ho, aby som vysvetlil svoj názor." },
          { key: "B", text: "Vypočujem si jeho argumenty a potom pokojne poviem svoj pohľad." },
          { key: "C", text: "Poviem mu, že sa mýli." },
          { key: "D", text: "Radšej prestanem diskutovať." },
        ],
        correct: "B",
      },
      {
        q: "Pri prezentácii pred triedou chceš, aby ti ostatní rozumeli. Čo je dôležité?",
        options: [
          { key: "A", text: "Hovoriť čo najrýchlejšie." },
          { key: "B", text: "Hovoriť jasne, štruktúrovane a primerane publiku." },
          { key: "C", text: "Použiť čo najviac odborných slov." },
          { key: "D", text: "Čítať celý text zo zošita." },
        ],
        correct: "B",
      },
      {
        q: "Kamarát ti hovorí o probléme. Čo ukazuje aktívne počúvanie?",
        options: [
          { key: "A", text: "Pozerám do mobilu, ale prikyvujem." },
          { key: "B", text: "Počúvam, pýtam sa doplňujúce otázky a nehodnotím ho hneď." },
          { key: "C", text: "Hneď mu poviem, čo má robiť." },
          { key: "D", text: "Zmením tému." },
        ],
        correct: "B",
      },
      {
        q: "V skupine vznikne nedorozumenie. Čo je najlepšie?",
        options: [
          { key: "A", text: "Obviniť toho, kto podľa mňa problém spôsobil." },
          { key: "B", text: "Pomenovať problém pokojne a hľadať spoločné riešenie." },
          { key: "C", text: "Odísť zo skupiny." },
          { key: "D", text: "Tváriť sa, že sa nič nestalo." },
        ],
        correct: "B",
      },
      {
        q: "Pri písaní správy učiteľovi je najvhodnejšie:",
        options: [
          { key: "A", text: "Písať bez pozdravu a bez kontextu." },
          { key: "B", text: "Napísať slušne, stručne a jasne, čo potrebujem." },
          { key: "C", text: "Použiť veľa skratiek." },
          { key: "D", text: "Poslať len otáznik." },
        ],
        correct: "B",
      },
    ],
    evaluation: scoredEval(
      "Odporúčanie: trénovať aktívne počúvanie, jasné vyjadrovanie a rešpektujúcu diskusiu.",
      "Odporúčanie: rozvíjať argumentáciu a prezentovanie pred skupinou.",
      "Silná stránka: jasná komunikácia, počúvanie a zvládanie konfliktov.",
    ),
  },
  "financna-gramotnost": {
    kind: "scored",
    slug: "financna-gramotnost",
    title: "Finančná gramotnosť",
    description: "Praktické rozhodovanie o financiách a rozpočte.",
    questions: [
      {
        q: "Máš 50 € a chceš si kúpiť slúchadlá za 40 € aj hru za 25 €. Čo je najrozumnejšie?",
        options: [
          { key: "A", text: "Kúpiť oboje a požičať si peniaze." },
          { key: "B", text: "Vybrať si jednu vec alebo si ešte došetriť." },
          { key: "C", text: "Minúť všetko hneď." },
          { key: "D", text: "Kúpiť drahšiu vec, lebo je určite lepšia." },
        ],
        correct: "B",
      },
      {
        q: "Čo znamená rozpočet?",
        options: [
          { key: "A", text: "Zoznam vecí, ktoré si chcem kúpiť." },
          { key: "B", text: "Plán príjmov a výdavkov." },
          { key: "C", text: "Peniaze od rodičov." },
          { key: "D", text: "Účet v banke." },
        ],
        correct: "B",
      },
      {
        q: "Ak si niečo kúpiš na splátky, znamená to:",
        options: [
          { key: "A", text: "Vec je zadarmo." },
          { key: "B", text: "Zaplatíš ju postupne, často aj s navýšením ceny." },
          { key: "C", text: "Nemusíš za ňu nikdy zaplatiť celú sumu." },
          { key: "D", text: "Je vždy lacnejšia." },
        ],
        correct: "B",
      },
      {
        q: "Prečo je dobré mať finančnú rezervu?",
        options: [
          { key: "A", text: "Aby som mohol minúť viac peňazí." },
          { key: "B", text: "Aby som zvládol nečakané výdavky." },
          { key: "C", text: "Aby som nemusel plánovať." },
          { key: "D", text: "Aby som si mohol vždy kúpiť niečo drahé." },
        ],
        correct: "B",
      },
      {
        q: "Čo je najlepší postup pred väčším nákupom?",
        options: [
          { key: "A", text: "Kúpiť hneď prvú možnosť." },
          { key: "B", text: "Porovnať cenu, kvalitu, potrebu a dostupný rozpočet." },
          { key: "C", text: "Riadiť sa len reklamou." },
          { key: "D", text: "Kúpiť to, čo majú všetci ostatní." },
        ],
        correct: "B",
      },
    ],
    evaluation: scoredEval(
      "Odporúčanie: pracovať s rozpočtom, plánovaním výdavkov a rozlišovaním potrieb od želaní.",
      "Odporúčanie: ďalej rozvíjať rozhodovanie pri nákupoch a tvorbu rezervy.",
      "Silná stránka: zodpovedné finančné rozhodovanie a plánovanie.",
    ),
  },
  "timova-spolupraca": {
    kind: "scored",
    slug: "timova-spolupraca",
    title: "Tímová spolupráca",
    description: "Riešenie úloh v skupine a projektová práca.",
    questions: [
      {
        q: "V skupine nikto nechce rozdeliť úlohy. Čo urobíš?",
        options: [
          { key: "A", text: "Počkám, kým to vyrieši niekto iný." },
          { key: "B", text: "Navrhnem, aby sme si rozdelili úlohy podľa silných stránok." },
          { key: "C", text: "Spravím všetko sám." },
          { key: "D", text: "Poviem, že skupina nefunguje." },
        ],
        correct: "B",
      },
      {
        q: "Jeden člen skupiny nestíha svoju časť práce. Čo je najlepšie?",
        options: [
          { key: "A", text: "Kritizovať ho pred ostatnými." },
          { key: "B", text: "Zistiť, kde je problém, a hľadať riešenie v skupine." },
          { key: "C", text: "Vyhodiť ho zo skupiny." },
          { key: "D", text: "Ignorovať to." },
        ],
        correct: "B",
      },
      {
        q: "Pri skupinovej práci máš iný názor ako ostatní. Ako postupuješ?",
        options: [
          { key: "A", text: "Presadzujem svoj názor za každú cenu." },
          { key: "B", text: "Vysvetlím svoj pohľad a vypočujem si argumenty ostatných." },
          { key: "C", text: "Radšej nič nepoviem." },
          { key: "D", text: "Prestávam spolupracovať." },
        ],
        correct: "B",
      },
      {
        q: "Čo pomáha dobrej tímovej práci?",
        options: [
          { key: "A", text: "Jasné úlohy, komunikácia a spoločný cieľ." },
          { key: "B", text: "Každý robí, čo chce." },
          { key: "C", text: "Jeden človek rozhoduje o všetkom." },
          { key: "D", text: "Nikto nenesie zodpovednosť." },
        ],
        correct: "A",
      },
      {
        q: "Ak tím spraví chybu, najlepšia reakcia je:",
        options: [
          { key: "A", text: "Nájsť vinníka." },
          { key: "B", text: "Pomenovať chybu, poučiť sa z nej a upraviť postup." },
          { key: "C", text: "Tváriť sa, že sa nič nestalo." },
          { key: "D", text: "Skončiť projekt." },
        ],
        correct: "B",
      },
    ],
    evaluation: scoredEval(
      "Odporúčanie: rozvíjať zodpovednosť, komunikáciu a prácu s rolami v tíme.",
      "Odporúčanie: posilniť riešenie konfliktov a spätnú väzbu.",
      "Silná stránka: spolupráca, zodpovednosť a schopnosť prispieť k spoločnému cieľu.",
    ),
  },
  "sebapoznanie": {
    kind: "personality",
    slug: "sebapoznanie",
    title: "Sebapoznanie",
    description: "Objavovanie silných stránok a osobného potenciálu.",
    questions: [
      {
        q: "Pri skupinovej práci najčastejšie:",
        options: [
          { key: "A", text: "Pomáham rozdeliť úlohy a sledovať postup." },
          { key: "B", text: "Premýšľam nad tým, čo môže zlyhať." },
          { key: "C", text: "Prinášam nové nápady." },
          { key: "D", text: "Podporujem ostatných, aby sa zapojili." },
        ],
      },
      {
        q: "Najviac ma baví:",
        options: [
          { key: "A", text: "Plánovať a organizovať." },
          { key: "B", text: "Riešiť logické problémy." },
          { key: "C", text: "Vymýšľať nové riešenia." },
          { key: "D", text: "Pomáhať ľuďom." },
        ],
      },
      {
        q: "Keď sa objaví problém:",
        options: [
          { key: "A", text: "Hľadám konkrétny plán." },
          { key: "B", text: "Analyzujem príčinu." },
          { key: "C", text: "Skúšam netradičné riešenie." },
          { key: "D", text: "Zisťujem, ako sa cítia ostatní." },
        ],
      },
      {
        q: "V tíme si ma ostatní často všímajú ako človeka, ktorý:",
        options: [
          { key: "A", text: "Vie veci zorganizovať." },
          { key: "B", text: "Premýšľa do hĺbky." },
          { key: "C", text: "Má veľa nápadov." },
          { key: "D", text: "Vytvára dobrú atmosféru." },
        ],
      },
      {
        q: "Najbližšie je mi tvrdenie:",
        options: [
          { key: "A", text: "Dobrý plán šetrí čas." },
          { key: "B", text: "Dobré rozhodnutie potrebuje dobré informácie." },
          { key: "C", text: "Každý problém sa dá riešiť inak." },
          { key: "D", text: "Ľudia podávajú lepší výkon, keď sa cítia prijatí." },
        ],
      },
    ],
    profiles: {
      A: { name: "Organizátor", strength: "plánovanie, zodpovednosť, koordinácia." },
      B: { name: "Analytik", strength: "premýšľanie, práca s informáciami, hľadanie súvislostí." },
      C: { name: "Tvorca", strength: "kreativita, nové nápady, flexibilita." },
      D: { name: "Podporovateľ", strength: "empatia, spolupráca, podpora tímu." },
    },
  },
};

export const TEST_LIST = Object.values(TESTS).map((t) => ({
  slug: t.slug,
  title: t.title,
  description: t.description,
  kind: t.kind,
}));
