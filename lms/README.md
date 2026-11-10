# LMS (Moodle) – jednotné prihlásenie z webu INVOK

Žiaci (kód + PIN) a učitelia (rola `ucitel`) sa prihlasujú iba na **invok.pscno.sk**.
Tlačidlom **„Vstúpiť do LMS“** na svojom dashboarde sa dostanú do Moodle
(**lms.invok.pscno.sk**) bez ďalšieho hesla.

## Ako to funguje

1. Web (server funkcie `src/lib/lms/lms.functions.ts`) overí žiaka alebo učiteľa a podpíše
   jednorazový odkaz `https://lms.invok.pscno.sk/auth/invok/login.php?t=…`
   (HMAC-SHA256, platnosť 60 s, každý odkaz sa dá použiť iba raz).
2. Moodle plugin `auth_invok` (`lms/moodle/auth/invok`) odkaz overí a:
   - pri prvom vstupe vytvorí účet (`invok-s-<id>` pre žiaka, `invok-t-<id>` pre učiteľa),
     potom už iba aktualizuje meno a e-mail,
   - zapíše používateľa do **všetkých kurzov**: žiaka ako `student`, učiteľa ako `teacher`
     (učiteľ bez práva upravovať obsah kurzu),
   - pridá ho do skupiny jeho školy. Kurzy majú vynútené „oddelené skupiny“, takže učiteľ
     vidí iba žiakov svojej školy.
3. Žiaci nemajú e-mail, preto dostanú technickú adresu `…@ziaci.invok.pscno.sk`
   a Moodle im e-maily neposiela.

Nové kurzy sa používateľovi doplnia pri jeho najbližšom vstupe do LMS.
Samoregistrácia v Moodle je vypnutá a heslom sa INVOK účty prihlásiť nedajú.

## Inštalácia / aktualizácia

```bash
cd /opt/invok-web && git pull           # alebo ./deploy.sh
sudo bash lms/install_lms_sso.sh        # plugin, kľúč, nastavenia Moodle, /etc/invok-web.env
~/deploy.sh                             # zostaví a reštartuje web s tlačidlom „Vstúpiť do LMS“
```

Skript sa dá spustiť opakovane. Existujúci kľúč nemení.

## Nastavenia

- Web: `INVOK_LMS_URL`, `INVOK_LMS_SECRET` v `/etc/invok-web.env`.
- Moodle: *Správa stránky → Zásuvné moduly → Autentifikácia → INVOK jednotné prihlásenie*
  (kľúč, prihlasovacia stránka webu, roly žiaka a učiteľa).
- Zmena kľúča: nastavte nový v Moodle aj v `/etc/invok-web.env` a reštartujte `invok-web`.
