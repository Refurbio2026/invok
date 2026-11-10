<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Entry point of the INVOK single sign-on: /auth/invok/login.php?t=<signed link>.
 *
 * @package    auth_invok
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');

use auth_invok\local\sso;

$token = required_param('t', PARAM_RAW_TRIMMED);

$PAGE->set_context(context_system::instance());
$PAGE->set_url(new moodle_url('/auth/invok/login.php'));
$PAGE->set_pagelayout('login');

$config = get_config('auth_invok');
$back = new moodle_url(trim((string) ($config->weburl ?? '')) ?: '/');

if (!is_enabled_auth('invok')) {
    throw new moodle_exception('notconfigured', 'auth_invok', $back);
}

try {
    $now = time();
    $claims = sso::verify($token, (string) ($config->secret ?? ''), $now);
    sso::consume($claims, $now);
    $user = sso::provision_user($claims);
    sso::enrol_everywhere($user, $claims);
} catch (moodle_exception $e) {
    throw new moodle_exception($e->errorcode, $e->module, $back);
}

// A different person may still be logged in on this browser (shared school computers).
if (isloggedin() && !isguestuser() && $USER->id != $user->id) {
    require_logout();
}

complete_user_login($user);
\core\session\manager::apply_concurrent_login_limit($user->id, session_id());

redirect(new moodle_url('/my/courses.php'));
