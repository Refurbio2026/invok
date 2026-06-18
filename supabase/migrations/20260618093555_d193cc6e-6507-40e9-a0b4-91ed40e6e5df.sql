INSERT INTO public.blog_posts (title, slug, excerpt, content, cover_image_url, author, status, published_at)
VALUES (
  'Keď sa škola stáva miestom nápadov, nie iba známok',
  'ked-sa-skola-stava-miestom-napadov',
  'Nový vzdelávací program INVOK pripravuje mladých ľudí na výzvy dnešného digitálneho sveta – prakticky, moderne a zmysluplne.',
  $HTML$<p>Čo ak by sa žiaci v škole neučili len odpovede na testové otázky, ale aj to, ako riešiť skutočné problémy? Čo ak by vedeli rozpoznať manipuláciu na internete, spolupracovať v tíme, obhájiť svoj názor a premeniť vlastný nápad na reálne riešenie?</p>
<p>Práve na tieto otázky odpovedá nový vzdelávací program <strong>INVOK</strong>, ktorý vzniká s cieľom pripraviť mladých ľudí na výzvy dnešného digitálneho sveta.</p>
<h2>Svet sa mení. Škola musí tiež.</h2>
<p>Dnešní žiaci vyrastajú v prostredí, kde majú prístup k obrovskému množstvu informácií. Nie všetky sú však pravdivé. Denne sa stretávajú s dezinformáciami, manipulatívnym obsahom, sociálnymi sieťami a technológiami, ktoré ovplyvňujú ich rozhodovanie viac ako kedykoľvek predtým.</p>
<p>Zároveň od nich budú budúci zamestnávatelia očakávať schopnosť <strong>spolupracovať, komunikovať, riešiť problémy, prichádzať s novými nápadmi a neustále sa učiť.</strong></p>
<p>Práve preto vznikol <strong>INVOK</strong>.</p>
<h2>Viac než len ďalší školský projekt</h2>
<p><strong>INVOK nie je klasický kurz ani ďalší predmet.</strong> Je to moderný vzdelávací program postavený na praktických skúsenostiach a aktívnom zapájaní žiakov.</p>
<p>Počas programu sa žiaci naučia:</p>
<ul>
<li><strong>identifikovať problémy vo svojom okolí,</strong></li>
<li><strong>navrhovať riešenia,</strong></li>
<li><strong>kriticky vyhodnocovať informácie,</strong></li>
<li><strong>rozpoznávať manipuláciu a hoaxy,</strong></li>
<li><strong>efektívne spolupracovať v tíme,</strong></li>
<li><strong>využívať digitálne nástroje,</strong></li>
<li><strong>prezentovať svoje myšlienky a obhájiť svoj názor.</strong></li>
</ul>
<p>Program je rozdelený do <strong>štyroch modulov</strong>, ktoré na seba logicky nadväzujú a vytvárajú jeden spoločný príbeh – od objavenia problému až po predstavenie vlastného riešenia.</p>
<h2>Od problému k riešeniu</h2>
<p>Jednou z najväčších výhod programu je jeho <strong>prepojenie s reálnym životom.</strong></p>
<p>Žiaci nebudú pracovať na vymyslených zadaniach. Budú hľadať skutočné problémy vo svojej škole alebo komunite, analyzovať ich príčiny, diskutovať o možných riešeniach a následne svoje návrhy predstavia spolužiakom, učiteľom či vedeniu školy.</p>
<p>Takto získajú skúsenosť, že <strong>aj ich hlas môže mať význam</strong> a že zmena sa začína vlastnou iniciatívou.</p>
<h2>Myslieť kriticky je dnes superpower</h2>
<p>Súčasťou programu bude aj rozvoj <strong>mediálnej gramotnosti a kritického myslenia.</strong></p>
<p>Žiaci sa naučia overovať zdroje informácií, rozlišovať fakty od názorov, identifikovať manipulatívne techniky a argumentovať na základe dôkazov.</p>
<p>V čase, keď sa internet stáva hlavným zdrojom informácií pre mladých ľudí, ide o <strong>jednu z najdôležitejších zručností budúcnosti.</strong></p>
<h2>Program pre všetkých</h2>
<p>INVOK je navrhnutý tak, aby bol dostupný aj pre žiakov so špeciálnymi výchovno-vzdelávacími potrebami. Počíta s využívaním videí, interaktívnych úloh, jednoduchého jazyka a moderných digitálnych nástrojov, ktoré umožnia zapojenie čo najväčšieho počtu žiakov.</p>
<p><strong>Cieľom nie je vytvoriť program pre vybraných, ale program pre všetkých.</strong></p>
<h2>Investícia do budúcnosti</h2>
<p>Program INVOK bude realizovaný počas troch rokov a jeho súčasťou bude aj meranie rozvoja kompetencií žiakov. Vďaka tomu bude možné sledovať nielen okamžitý prínos programu, ale aj jeho dlhodobý dopad.</p>
<p><strong>Skutočným úspechom však nebudú grafy ani štatistiky.</strong></p>
<p>Úspechom bude každý žiak, ktorý sa prestane báť povedať svoj názor. Každý tím, ktorý dokáže nájsť riešenie problému. Každá škola, ktorá vytvorí priestor pre tvorivosť, spoluprácu a nové nápady.</p>
<p><strong>INVOK totiž nie je len o vzdelávaní.</strong></p>
<p><strong>Je o tom, aby mladí ľudia verili, že dokážu meniť svet okolo seba.</strong></p>$HTML$,
  '/__l5e/assets-v1/b21ed636-e2af-4667-a080-59c543c5a7ed/clanok-invok-od-napadu-k-zmene.png',
  'Tím INVOK',
  'published',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image_url = EXCLUDED.cover_image_url,
  status = 'published',
  published_at = COALESCE(public.blog_posts.published_at, now());