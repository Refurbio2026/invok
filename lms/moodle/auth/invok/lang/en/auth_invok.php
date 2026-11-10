<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Strings for auth_invok.
 *
 * @package    auth_invok
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['auth_invokdescription'] = 'Pupils and teachers log in on the INVOK website and enter Moodle through a one-time signed link. Accounts are created automatically and enrolled in every course.';
$string['invalidtoken'] = 'The login link is invalid or has expired. Go back to the INVOK website and click "Enter LMS" again.';
$string['loginbutton'] = 'Log in through the INVOK website';
$string['notconfigured'] = 'INVOK login is not enabled or configured on this site.';
$string['pluginname'] = 'INVOK single sign-on';
$string['privacy:metadata'] = 'The INVOK single sign-on plugin does not store personal data.';
$string['role_desc'] = 'Short name of the course role given to this group of users in every course.';
$string['secret'] = 'Shared secret';
$string['secret_desc'] = 'Must be identical to INVOK_LMS_SECRET on the INVOK web server (at least 32 characters).';
$string['studentrole'] = 'Pupil role';
$string['suspended'] = 'Your LMS account is suspended. Contact the INVOK administrator.';
$string['teacherrole'] = 'Teacher role';
$string['weburl'] = 'INVOK login page';
$string['weburl_desc'] = 'Users who open the Moodle login page are offered this link.';
