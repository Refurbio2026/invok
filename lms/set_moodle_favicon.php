<?php
// INVOK – nastaví favicon Moodle (lms.invok.pscno.sk) podľa webu invok.pscno.sk.
//
// Spustenie na serveri:
//   cd /tmp && sudo -u www-data php < lms/set_moodle_favicon.php
//
// To isté sa dá urobiť ručne: Správa stránky → Vzhľad → Logá → Favicon.
define('CLI_SCRIPT', true);
require('/var/www/moodle/config.php');

$sources = ['/opt/invok-web/public/favicon.png', 'https://invok.pscno.sk/favicon.png'];
$content = false;
foreach ($sources as $source) {
    $content = @file_get_contents($source);
    if ($content !== false && @imagecreatefromstring($content) !== false) {
        break;
    }
    $content = false;
}
if ($content === false) {
    cli_error('Favicon sa nepodarilo načítať z: ' . implode(', ', $sources));
}

$fs = get_file_storage();
$context = context_system::instance();
$fs->delete_area_files($context->id, 'core_admin', 'favicon', 0);
$fs->create_file_from_string([
    'contextid' => $context->id,
    'component' => 'core_admin',
    'filearea'  => 'favicon',
    'itemid'    => 0,
    'filepath'  => '/',
    'filename'  => 'favicon.png',
], $content);
set_config('favicon', '/favicon.png', 'core_admin');
theme_reset_all_caches();
echo 'Favicon nastavený (' . strlen($content) . " B).\n";
