import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";

export const Route = createFileRoute("/ochrana-osobnych-udajov")({
  head: () => ({
    meta: [
      { title: "Ochrana osobných údajov – INVOK" },
      {
        name: "description",
        content:
          "Informácie o spracúvaní osobných údajov v rámci portálu INVOK v súlade s GDPR a zákonom č. 18/2018 Z. z.",
      },
      { property: "og:title", content: "Ochrana osobných údajov – INVOK" },
      {
        property: "og:description",
        content:
          "Ako PSC n.o. spracúva osobné údaje používateľov portálu INVOK.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              Právne informácie
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Ochrana osobných údajov
            </h1>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 prose-content">
          <p>
            PSC n.o. kladie dôraz na ochranu osobných údajov a rešpektovanie
            súkromia všetkých používateľov portálu INVOK. Osobné údaje
            spracúvame v súlade s platnými právnymi predpismi, najmä Nariadením
            Európskeho parlamentu a Rady (EÚ) 2016/679 (GDPR) a zákonom č.
            18/2018 Z. z. o ochrane osobných údajov.
          </p>

          <H2>Prevádzkovateľ</H2>
          <p>Prevádzkovateľom osobných údajov je:</p>
          <p>
            <strong>PSC n.o.</strong>
            <br />
            E-mail:{" "}
            <a className="text-primary hover:underline" href="mailto:info@pscno.sk">
              info@pscno.sk
            </a>
          </p>
          <p>Ďalšie identifikačné údaje budú doplnené podľa oficiálnych údajov organizácie.</p>

          <H2>Aké údaje spracúvame</H2>
          <p>V závislosti od využívaných služieb môžeme spracúvať:</p>
          <ul>
            <li>meno a priezvisko kontaktnej osoby školy,</li>
            <li>e-mailovú adresu,</li>
            <li>telefónne číslo,</li>
            <li>názov školy a organizačné údaje,</li>
            <li>údaje z kontaktných formulárov,</li>
            <li>technické údaje o používaní webového sídla.</li>
          </ul>
          <p>
            V prípade žiakov sa systém INVOK usiluje minimalizovať spracúvanie
            osobných údajov. Na identifikáciu žiakov môžu byť využívané anonymné
            identifikátory alebo systémové kódy namiesto osobných údajov.
          </p>

          <H2>Účel spracúvania osobných údajov</H2>
          <p>Osobné údaje spracúvame najmä za účelom:</p>
          <ul>
            <li>komunikácie so školami a partnermi,</li>
            <li>registrácie a správy používateľských účtov,</li>
            <li>poskytovania vzdelávacích aktivít,</li>
            <li>vyhodnocovania zapojenia do programu,</li>
            <li>tvorby súhrnných štatistík a reportov,</li>
            <li>zabezpečenia funkčnosti a bezpečnosti systému.</li>
          </ul>

          <H2>Právny základ spracúvania</H2>
          <p>Osobné údaje spracúvame na základe:</p>
          <ul>
            <li>plnenia zmluvných a predzmluvných vzťahov,</li>
            <li>oprávneného záujmu prevádzkovateľa,</li>
            <li>plnenia zákonných povinností,</li>
            <li>súhlasu dotknutej osoby, ak je vyžadovaný.</li>
          </ul>

          <H2>Doba uchovávania údajov</H2>
          <p>
            Osobné údaje uchovávame len počas obdobia nevyhnutného na splnenie
            účelu, na ktorý boli získané, alebo počas obdobia vyžadovaného
            právnymi predpismi.
          </p>

          <H2>Príjemcovia osobných údajov</H2>
          <p>
            Osobné údaje môžu byť sprístupnené poskytovateľom technických
            služieb a zmluvným partnerom, ktorí zabezpečujú prevádzku systému,
            hosting, správu informačných technológií alebo analytické služby, a
            to výlučne v rozsahu potrebnom na poskytovanie služieb.
          </p>

          <H2>Práva dotknutých osôb</H2>
          <p>Každá dotknutá osoba má právo:</p>
          <ul>
            <li>na prístup k svojim osobným údajom,</li>
            <li>na opravu nesprávnych údajov,</li>
            <li>na vymazanie údajov, ak sú splnené zákonné podmienky,</li>
            <li>na obmedzenie spracúvania,</li>
            <li>na prenosnosť údajov,</li>
            <li>namietať proti spracúvaniu,</li>
            <li>
              podať sťažnosť Úradu na ochranu osobných údajov Slovenskej
              republiky.
            </li>
          </ul>

          <H2>Kontakt</H2>
          <p>
            V prípade otázok týkajúcich sa ochrany osobných údajov nás môžete
            kontaktovať na adrese:{" "}
            <a className="text-primary hover:underline" href="mailto:info@pscno.sk">
              info@pscno.sk
            </a>
          </p>

          <H2>Aktualizácia dokumentu</H2>
          <p>
            Tento dokument môže byť priebežne aktualizovaný v závislosti od
            vývoja projektu INVOK, zmien funkcionality systému alebo
            legislatívnych požiadaviek.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground">
      {children}
    </h2>
  );
}
