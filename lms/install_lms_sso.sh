#!/bin/bash
# INVOK – jednotné prihlásenie z webu invok.pscno.sk do Moodle (lms.invok.pscno.sk).
#
# Použitie (na serveri, z koreňa repozitára):
#   sudo bash lms/install_lms_sso.sh
#
# Čo robí (opakované spustenie je bezpečné):
#   1. skopíruje plugin auth_invok do Moodle a spustí upgrade (vytvorí tabuľku),
#   2. vygeneruje zdieľaný kľúč (ak ešte nie je) a zapne prihlásenie „INVOK“,
#   3. vypne samoregistráciu v Moodle (účty vznikajú len cez web INVOK),
#   4. nastaví vo všetkých kurzoch vynútené „oddelené skupiny“ – učiteľ vidí iba žiakov svojej školy,
#   5. zapíše INVOK_LMS_URL a INVOK_LMS_SECRET do /etc/invok-web.env a reštartuje web.

set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Spustite cez sudo."; exit 1; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_DIR/lms/moodle/auth/invok"
MOODLE=/var/www/moodle
DEST="$MOODLE/public/auth/invok"
LMS_URL="${LMS_URL:-https://lms.invok.pscno.sk}"
WEB_ENV=/etc/invok-web.env

[[ -f "$SRC/version.php" ]] || { echo "Nenašiel som plugin v $SRC"; exit 1; }
[[ -d "$MOODLE/public/auth" ]] || { echo "Nenašiel som Moodle v $MOODLE"; exit 1; }

cd /tmp   # www-data nemusí mať prístup do aktuálneho priečinka
moodle_cfg() { sudo -u www-data php "$MOODLE/admin/cli/cfg.php" "$@"; }

echo "== 1/5 Plugin auth_invok"
rm -rf "$DEST.new"
cp -r "$SRC" "$DEST.new"
chown -R root:root "$DEST.new"
find "$DEST.new" -type d -exec chmod 755 {} +
find "$DEST.new" -type f -exec chmod 644 {} +
rm -rf "$DEST"
mv "$DEST.new" "$DEST"
sudo -u www-data php "$MOODLE/admin/cli/upgrade.php" --non-interactive

echo "== 2/5 Zdieľaný kľúč a zapnutie prihlásenia"
SECRET="$(moodle_cfg --component=auth_invok --name=secret 2>/dev/null || true)"
if [[ ${#SECRET} -lt 32 ]]; then
  SECRET="$(openssl rand -hex 32)"
  moodle_cfg --component=auth_invok --name=secret --set="$SECRET"
  echo "   vygenerovaný nový kľúč"
else
  echo "   kľúč už existuje – ponechávam"
fi
AUTH="$(moodle_cfg --name=auth 2>/dev/null || true)"
if [[ ",$AUTH," != *",invok,"* ]]; then
  moodle_cfg --name=auth --set="${AUTH:+$AUTH,}invok"
fi
echo "   zapnuté metódy prihlásenia: $(moodle_cfg --name=auth)"

echo "== 3/5 Vypnutie samoregistrácie"
moodle_cfg --name=registerauth --set=""

echo "== 4/5 Oddelené skupiny vo všetkých kurzoch"
moodle_cfg --component=moodlecourse --name=groupmode --set=1
moodle_cfg --component=moodlecourse --name=groupmodeforce --set=1
sudo -u www-data php <<'PHP'
<?php
define('CLI_SCRIPT', true);
require('/var/www/moodle/config.php');
$DB->execute('UPDATE {course} SET groupmode = 1, groupmodeforce = 1 WHERE id <> ?', [SITEID]);
echo "   kurzov nastavených: " . $DB->count_records_select('course', 'id <> ?', [SITEID]) . "\n";
PHP
sudo -u www-data php "$MOODLE/admin/cli/purge_caches.php"

echo "== 5/5 Nastavenie webu ($WEB_ENV)"
touch "$WEB_ENV"
sed -i '/^INVOK_LMS_URL=/d;/^INVOK_LMS_SECRET=/d' "$WEB_ENV"
printf 'INVOK_LMS_URL=%s\nINVOK_LMS_SECRET=%s\n' "$LMS_URL" "$SECRET" >> "$WEB_ENV"
if systemctl is-active --quiet invok-web; then
  systemctl restart invok-web
  echo "   invok-web reštartovaný"
fi

echo
echo "Hotovo. Žiaci a učitelia teraz vstupujú do LMS tlačidlom „Vstúpiť do LMS“ na svojom dashboarde."
echo "Kontrola: Správa stránky → Zásuvné moduly → Autentifikácia → INVOK jednotné prihlásenie."
