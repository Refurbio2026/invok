<?php
// INVOK – pod prihlasovací formulár Moodle (lms.invok.pscno.sk) pridá logá
// Európska únia, Program Slovensko a MPSVR SR.
//
// Spustenie na serveri:
//   cd /tmp && sudo -u www-data php < lms/set_moodle_login_logos.php
//
// Logá sa načítavajú z webu (invok.pscno.sk/logos/…, priečinok public/logos v repozitári).
// Zapisuje sa do Správa stránky → Vzhľad → Doplnkové HTML → „Pred zatvorením BODY“,
// medzi značky INVOK-LOGA; ostatný obsah tohto poľa zostane. Opakované spustenie je bezpečné.
define('CLI_SCRIPT', true);
require('/var/www/moodle/config.php');

$base = 'https://invok.pscno.sk/logos/';
$block = <<<HTML
<!-- INVOK-LOGA start -->
<div id="invok-funding" class="invok-funding" hidden>
  <img src="{$base}eu-logo.png" alt="Európska únia" class="invok-funding-eu">
  <img src="{$base}program-slovensko-logo.png" alt="Program Slovensko">
  <img src="{$base}mpsvr-logo.png" alt="Ministerstvo práce, sociálnych vecí a rodiny SR">
</div>
<style>
  .invok-funding { display: flex; flex-wrap: wrap; justify-content: center; align-items: center;
    gap: 1.25rem 2rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--bs-border-color, #dee2e6); }
  .invok-funding[hidden] { display: none; }
  .invok-funding img { height: 52px; width: auto; max-width: 100%; }
  .invok-funding img.invok-funding-eu { height: 64px; }
</style>
<script>
  (function () {
    var logos = document.getElementById('invok-funding');
    var box = document.querySelector('#page-login-index .login-container');
    if (!logos) { return; }
    if (box) { box.appendChild(logos); logos.hidden = false; } else { logos.remove(); }
  })();
</script>
<!-- INVOK-LOGA end -->
HTML;

$current = (string) get_config('core', 'additionalhtmlfooter');
$pattern = '/<!-- INVOK-LOGA start -->.*?<!-- INVOK-LOGA end -->\s*/s';
$without = trim(preg_replace($pattern, '', $current));
$new = ($without === '' ? '' : $without . "\n") . $block;
set_config('additionalhtmlfooter', $new);
purge_caches(['theme' => true, 'other' => true]);
echo $without === '' ? "Logá pridané.\n" : "Logá pridané (pôvodný obsah Doplnkového HTML zostal).\n";
