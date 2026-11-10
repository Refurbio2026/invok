<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * INVOK single sign-on: users log in on the INVOK website and arrive here
 * through a short-lived signed link (see login.php). There are no local passwords.
 *
 * @package    auth_invok
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/authlib.php');

/**
 * Authentication plugin for accounts managed by the INVOK website.
 */
class auth_plugin_invok extends auth_plugin_base {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->authtype = 'invok';
        $this->config = get_config('auth_invok');
    }

    /**
     * Password login is never possible; accounts log in only through login.php.
     *
     * @param string $username
     * @param string $password
     * @return bool
     */
    public function user_login($username, $password) {
        return false;
    }

    public function prevent_local_passwords() {
        return true;
    }

    public function is_internal() {
        return false;
    }

    public function can_change_password() {
        return false;
    }

    public function can_reset_password() {
        return false;
    }

    public function can_signup() {
        return false;
    }

    public function can_be_manually_set() {
        return false;
    }

    /**
     * Button on the Moodle login page that sends users to the INVOK website.
     *
     * @param string $wantsurl
     * @return array
     */
    public function loginpage_idp_list($wantsurl) {
        $weburl = trim((string) ($this->config->weburl ?? ''));
        if ($weburl === '') {
            return [];
        }
        return [[
            'url' => new moodle_url($weburl),
            'icon' => new pix_icon('i/permissions', ''),
            'name' => get_string('loginbutton', 'auth_invok'),
        ]];
    }
}
