<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Settings for auth_invok.
 *
 * @package    auth_invok
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    $settings->add(new admin_setting_heading('auth_invok/intro', '',
        new lang_string('auth_invokdescription', 'auth_invok')));
    $settings->add(new admin_setting_configpasswordunmask('auth_invok/secret',
        new lang_string('secret', 'auth_invok'), new lang_string('secret_desc', 'auth_invok'), ''));
    $settings->add(new admin_setting_configtext('auth_invok/weburl',
        new lang_string('weburl', 'auth_invok'), new lang_string('weburl_desc', 'auth_invok'),
        'https://invok.pscno.sk/prihlasenie', PARAM_URL));
    $settings->add(new admin_setting_configtext('auth_invok/studentrole',
        new lang_string('studentrole', 'auth_invok'), new lang_string('role_desc', 'auth_invok'),
        'student', PARAM_ALPHANUMEXT));
    $settings->add(new admin_setting_configtext('auth_invok/teacherrole',
        new lang_string('teacherrole', 'auth_invok'), new lang_string('role_desc', 'auth_invok'),
        'teacher', PARAM_ALPHANUMEXT));
}
