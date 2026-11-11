#!/bin/bash
# INVOK – presun Moodle na novú doménu (predvolene lms.invok.pscno.sk -> lms.pscno.sk).
#
# Predpoklad: DNS záznam A novej domény už ukazuje na tento server.
#
# Použitie (na serveri, z koreňa repozitára):
#   sudo bash lms/change_lms_domain.sh [nová_doména] [stará_doména]
#
# Čo robí:
#   1. overí DNS, zálohuje nginx konfiguráciu a Moodle config.php,
#   2. získa HTTPS certifikát Let's Encrypt pre novú doménu,
#   3. nastaví nginx: Moodle beží na novej doméne, stará doména presmeruje (301) na novú,
#   4. zmení wwwroot v Moodle a nahradí starú adresu v databáze (obsah aj nastavenia),
#   5. upraví INVOK_LMS_URL pre web a reštartuje ho.

set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Spustite cez sudo."; exit 1; }

NEW="${1:-lms.pscno.sk}"
OLD="${2:-lms.invok.pscno.sk}"
EMAIL="${CERTBOT_EMAIL:-it@pscno.sk}"
MOODLE=/var/www/moodle
NGINX_CONF="$(readlink -f /etc/nginx/sites-enabled/moodle)"
ACME_ROOT=/var/www/letsencrypt
WEB_ENV=/etc/invok-web.env
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "== 1/5 Kontrola ($OLD -> $NEW)"
SERVER_IP="$(curl -s -4 https://ifconfig.me || true)"
DNS_IP="$(dig +short "$NEW" A @1.1.1.1 | tail -1)"
if [[ -z "$DNS_IP" || "$DNS_IP" != "$SERVER_IP" ]]; then
  echo "DNS pre $NEW ukazuje na '${DNS_IP:-nič}', ale tento server má IP $SERVER_IP."
  echo "Najprv nastavte v DNS záznam A: $NEW -> $SERVER_IP a počkajte, kým sa zmena prejaví."
  exit 1
fi
[[ -f "$NGINX_CONF" ]] || { echo "Nenašiel som nginx konfiguráciu Moodle."; exit 1; }
[[ -d "/etc/letsencrypt/live/$OLD" ]] || { echo "Nenašiel som certifikát pre $OLD."; exit 1; }
cp "$NGINX_CONF" "$NGINX_CONF.bak-$STAMP"
cp "$MOODLE/config.php" "$MOODLE/config.php.bak-$STAMP"
echo "   zálohy: $NGINX_CONF.bak-$STAMP, $MOODLE/config.php.bak-$STAMP"

moodle_server_block() {   # $1 = doména, $2 = cesta k certifikátu
cat <<EOF
server {
    server_name $1;
    root $MOODLE/public;
    index index.php;
    client_max_body_size 200M;

    # Router Moodle 5.x: vsetko, co neexistuje ako subor, ide na r.php
    location / {
        try_files \$uri \$uri/ /r.php;
    }
    location ~ [^/]\.php(/|\$) {
        fastcgi_split_path_info ^(.+\.php)(/.*)\$;
        set \$path_info \$fastcgi_path_info;
        try_files \$fastcgi_script_name /r.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param PATH_INFO \$path_info;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_read_timeout 300;
    }
    location ~ /\.(?!well-known) { deny all; }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/$2/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$2/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
EOF
}

http_block() {
cat <<EOF
server {
    listen 80;
    server_name $NEW $OLD;
    location /.well-known/acme-challenge/ { root $ACME_ROOT; }
    location / { return 301 https://$NEW\$request_uri; }
}
EOF
}

echo "== 2/5 Certifikát pre $NEW"
mkdir -p "$ACME_ROOT"
if [[ ! -d "/etc/letsencrypt/live/$NEW" ]]; then
  # Dočasne: Moodle ešte beží na starej doméne, port 80 obsluhuje overenie certifikátu.
  { moodle_server_block "$OLD" "$OLD"; http_block; } > "$NGINX_CONF"
  nginx -t && systemctl reload nginx
  certbot certonly --webroot -w "$ACME_ROOT" -d "$NEW" -m "$EMAIL" --agree-tos --non-interactive
else
  echo "   certifikát už existuje"
fi

echo "== 3/5 nginx: $NEW + presmerovanie z $OLD"
{
  moodle_server_block "$NEW" "$NEW"
  cat <<EOF
server {
    listen 443 ssl;
    server_name $OLD;
    ssl_certificate /etc/letsencrypt/live/$OLD/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$OLD/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    return 301 https://$NEW\$request_uri;
}
EOF
  http_block
} > "$NGINX_CONF"
if ! nginx -t; then
  echo "nginx konfigurácia je chybná – vraciam zálohu."
  cp "$NGINX_CONF.bak-$STAMP" "$NGINX_CONF"; systemctl reload nginx; exit 1
fi
systemctl reload nginx

echo "== 4/5 Moodle wwwroot a databáza"
sed -i "s#^\(\$CFG->wwwroot *= *'\)https://$OLD'#\1https://$NEW'#" "$MOODLE/config.php"
grep -q "wwwroot *= *'https://$NEW'" "$MOODLE/config.php" || { echo "wwwroot sa nepodarilo zmeniť."; exit 1; }
cd /tmp
sudo -u www-data php "$MOODLE/admin/tool/replace/cli/replace.php" \
  --search="https://$OLD" --replace="https://$NEW" --non-interactive
sudo -u www-data env OLD="$OLD" NEW="$NEW" php <<'PHP'
<?php
define('CLI_SCRIPT', true);
require('/var/www/moodle/config.php');
$old = 'https://' . getenv('OLD'); $new = 'https://' . getenv('NEW');
$count = 0;
foreach (['config' => null, 'config_plugins' => 'plugin'] as $table => $pluginfield) {
    $rows = $DB->get_records_select($table, $DB->sql_like('value', ':v'), ['v' => '%' . $old . '%']);
    foreach ($rows as $r) {
        set_config($r->name, str_replace($old, $new, $r->value), $pluginfield ? $r->$pluginfield : null);
        echo "   nastavenie " . ($pluginfield ? $r->$pluginfield . '/' : '') . $r->name . "\n";
        $count++;
    }
}
echo "   upravených nastavení: $count\n";
PHP
sudo -u www-data php "$MOODLE/admin/cli/purge_caches.php"
[[ -f /root/invok-moodle-pristupy.txt ]] && sed -i "s#https://$OLD#https://$NEW#g" /root/invok-moodle-pristupy.txt

echo "== 5/5 Web INVOK ($WEB_ENV)"
if [[ -f "$WEB_ENV" ]]; then
  sed -i '/^INVOK_LMS_URL=/d' "$WEB_ENV"
  echo "INVOK_LMS_URL=https://$NEW" >> "$WEB_ENV"
  systemctl is-active --quiet invok-web && systemctl restart invok-web && echo "   invok-web reštartovaný"
fi

echo
echo "Hotovo. Moodle beží na https://$NEW, stará adresa https://$OLD presmeruje na novú."
echo "Kontrola: curl -sI https://$NEW/login/index.php | head -1"
