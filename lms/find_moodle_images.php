<?php
// INVOK – iba vypíše, kde sú v Moodle obrázky a texty „AI generated“. Nič nemení.
//
// Spustenie na serveri:
//   cd /tmp && sudo -u www-data php < lms/find_moodle_images.php
define('CLI_SCRIPT', true);
require('/var/www/moodle/config.php');

echo "== Obrázky v obsahu (bez používateľských a systémových súborov)\n";
$files = $DB->get_records_sql("
    SELECT f.id, f.contextid, f.component, f.filearea, f.itemid, f.filepath, f.filename, f.filesize,
           f.mimetype, f.timecreated, c.contextlevel, c.instanceid
      FROM {files} f
      JOIN {context} c ON c.id = f.contextid
     WHERE f.mimetype LIKE 'image/%'
       AND f.filename <> '.'
       AND f.component NOT IN ('user', 'core_admin', 'assignfeedback_editpdf', 'core_h5p')
  ORDER BY f.timecreated DESC");
foreach ($files as $f) {
    $where = "context {$f->contextid} (level {$f->contextlevel}, instance {$f->instanceid})";
    if ($f->contextlevel == CONTEXT_COURSE) {
        $where .= ' = kurz „' . $DB->get_field('course', 'fullname', ['id' => $f->instanceid]) . '“';
    } else if ($f->contextlevel == CONTEXT_BLOCK) {
        $where .= ' = blok ' . $DB->get_field('block_instances', 'blockname', ['id' => $f->instanceid]);
    }
    printf("#%d %s/%s/%d%s%s  %s  %d B  %s\n   %s\n", $f->id, $f->component, $f->filearea, $f->itemid,
        $f->filepath, $f->filename, $f->mimetype, $f->filesize, userdate($f->timecreated, '%d.%m.%Y %H:%M'), $where);
}
if (!$files) {
    echo "   (žiadne)\n";
}

echo "\n== Texty s <img> alebo „AI“\n";
$like = function(string $field): string {
    global $DB;
    return '(' . $DB->sql_like($field, ':a', false) . ' OR ' . $DB->sql_like($field, ':b', false) . ')';
};
$params = ['a' => '%<img%', 'b' => '%AI generated%'];
$sources = [
    ['course', 'summary', 'fullname'],
    ['course_sections', 'summary', 'name'],
    ['label', 'intro', 'name'],
    ['page', 'content', 'name'],
    ['page', 'intro', 'name'],
];
foreach ($sources as [$table, $field, $namefield]) {
    foreach ($DB->get_records_select($table, $like($field), $params, 'id', "id, $namefield, $field") as $r) {
        echo "-- $table.$field #{$r->id} „" . $r->$namefield . "“\n";
        if (preg_match_all('/<img[^>]*>/i', $r->$field, $m)) {
            foreach ($m[0] as $img) {
                echo "   $img\n";
            }
        }
        if (stripos($r->$field, 'AI generated') !== false) {
            echo "   (obsahuje text „AI generated“)\n";
        }
    }
}
foreach ($DB->get_records('block_instances', null, 'id', 'id, blockname, parentcontextid, configdata') as $b) {
    $config = $b->configdata ? @unserialize(base64_decode($b->configdata)) : null;
    $text = is_object($config) && isset($config->text) ? (string) $config->text : '';
    if (stripos($text, '<img') !== false || stripos($text, 'AI generated') !== false) {
        echo "-- blok {$b->blockname} #{$b->id} (parentcontext {$b->parentcontextid})\n";
        preg_match_all('/<img[^>]*>/i', $text, $m);
        foreach ($m[0] as $img) {
            echo "   $img\n";
        }
    }
}
echo "\n== Nastavenia témy s obrázkom\n";
foreach (['theme_boost' => ['backgroundimage', 'loginbackgroundimage'], 'core_admin' => ['logo', 'logocompact']] as $plugin => $names) {
    foreach ($names as $name) {
        $value = get_config($plugin, $name);
        if ($value) {
            echo "   $plugin/$name = $value\n";
        }
    }
}
echo "\nHotovo.\n";
