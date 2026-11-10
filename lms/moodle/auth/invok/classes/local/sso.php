<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

namespace auth_invok\local;

use context_course;
use moodle_exception;
use stdClass;

/**
 * Verifies INVOK login links and provisions the matching Moodle account.
 *
 * A link carries "<payload>.<signature>", both base64url. The payload is JSON:
 * {v, jti, iat, exp, role: student|teacher, uid, fn, ln, email?, school: {id, name}}
 * and the signature is HMAC-SHA256(secret, "<payload>").
 *
 * @package    auth_invok
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class sso {

    /** Longest lifetime of a link we accept, in seconds. */
    const MAX_LIFETIME = 300;

    /** Allowed clock difference between the web server and Moodle, in seconds. */
    const CLOCK_SKEW = 30;

    /** Matches a UUID as used by the INVOK database. */
    const UUID = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/';

    /**
     * Decodes base64url.
     *
     * @param string $value
     * @return string|false
     */
    protected static function b64url_decode(string $value) {
        if (!preg_match('/^[A-Za-z0-9_-]*$/', $value)) {
            return false;
        }
        $padded = strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4);
        return base64_decode($padded, true);
    }

    /**
     * Checks the signature and claims of a link and returns its payload.
     *
     * @param string $token
     * @param string $secret
     * @param int $now
     * @return stdClass
     * @throws moodle_exception when the link is not valid
     */
    public static function verify(string $token, string $secret, int $now): stdClass {
        if (strlen($secret) < 32) {
            throw new moodle_exception('notconfigured', 'auth_invok');
        }
        $parts = explode('.', $token);
        if (count($parts) !== 2 || strlen($token) > 4096) {
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }
        [$payloadb64, $sigb64] = $parts;
        $expected = hash_hmac('sha256', $payloadb64, $secret, true);
        $signature = self::b64url_decode($sigb64);
        if ($signature === false || !hash_equals($expected, $signature)) {
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }
        $json = self::b64url_decode($payloadb64);
        $data = $json === false ? null : json_decode($json);
        if (!$data instanceof stdClass) {
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }

        $valid = ($data->v ?? null) === 1
            && is_string($data->jti ?? null) && preg_match('/^[A-Za-z0-9_-]{16,64}$/', $data->jti)
            && is_int($data->iat ?? null) && is_int($data->exp ?? null)
            && $data->iat <= $now + self::CLOCK_SKEW
            && $data->exp > $now
            && $data->exp - $data->iat <= self::MAX_LIFETIME
            && in_array($data->role ?? null, ['student', 'teacher'], true)
            && is_string($data->uid ?? null) && preg_match(self::UUID, $data->uid)
            && isset($data->school) && is_string($data->school->id ?? null)
            && preg_match(self::UUID, $data->school->id)
            && is_string($data->school->name ?? '');
        if (!$valid) {
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }
        return $data;
    }

    /**
     * Records the link as used, so it cannot be opened a second time.
     *
     * @param stdClass $claims
     * @param int $now
     * @throws moodle_exception when the link was already used
     */
    public static function consume(stdClass $claims, int $now): void {
        global $DB;
        $DB->delete_records_select('auth_invok_used', 'timeexpires < ?', [$now - self::CLOCK_SKEW]);
        if ($DB->record_exists('auth_invok_used', ['jti' => $claims->jti])) {
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }
        try {
            $DB->insert_record('auth_invok_used', (object) ['jti' => $claims->jti, 'timeexpires' => $claims->exp]);
        } catch (\dml_write_exception $e) {
            // Unique index hit: another request used the same link at the same moment.
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }
    }

    /**
     * Moodle username for an INVOK account. Pupils and teachers live in separate INVOK tables,
     * so the role is part of the name.
     *
     * @param stdClass $claims
     * @return string
     */
    public static function username(stdClass $claims): string {
        return 'invok-' . ($claims->role === 'teacher' ? 't' : 's') . '-' . $claims->uid;
    }

    /**
     * Cleans a name part and falls back to a default when it is empty.
     *
     * @param mixed $value
     * @param string $default
     * @return string
     */
    protected static function name($value, string $default): string {
        $value = trim(clean_param(is_string($value) ? $value : '', PARAM_NOTAGS));
        return \core_text::substr($value === '' ? $default : $value, 0, 100);
    }

    /**
     * Creates the Moodle account on first visit and keeps names and e-mail in sync afterwards.
     *
     * @param stdClass $claims
     * @return stdClass the user record
     */
    public static function provision_user(stdClass $claims): stdClass {
        global $CFG, $DB;

        $username = self::username($claims);
        $isteacher = $claims->role === 'teacher';
        $email = is_string($claims->email ?? null) ? clean_param(trim($claims->email), PARAM_EMAIL) : '';
        if ($email === '') {
            // Pupils log in with a code and PIN and have no e-mail. Moodle requires one,
            // so they get an address that never receives mail.
            $email = $username . '@ziaci.invok.pscno.sk';
        }
        $fields = [
            'firstname' => self::name($claims->fn ?? '', $isteacher ? 'Učiteľ' : 'Žiak'),
            'lastname' => self::name($claims->ln ?? '', 'INVOK'),
            'email' => $email,
            'institution' => self::name($claims->school->name ?? '', ''),
        ];

        $user = $DB->get_record('user', ['username' => $username, 'mnethostid' => $CFG->mnet_localhost_id]);
        if (!$user) {
            $new = (object) array_merge($fields, [
                'username' => $username,
                'auth' => 'invok',
                'idnumber' => $username,
                'confirmed' => 1,
                'mnethostid' => $CFG->mnet_localhost_id,
                'password' => AUTH_PASSWORD_NOT_CACHED,
                'emailstop' => $isteacher ? 0 : 1,
                'lang' => $CFG->lang,
            ]);
            $id = \core\user::create_user($new, false);
            return $DB->get_record('user', ['id' => $id], '*', MUST_EXIST);
        }

        if ($user->auth !== 'invok' || !empty($user->deleted)) {
            throw new moodle_exception('invalidtoken', 'auth_invok');
        }
        if (!empty($user->suspended)) {
            throw new moodle_exception('suspended', 'auth_invok');
        }
        $changes = new stdClass();
        foreach ($fields as $field => $value) {
            if ((string) $user->$field !== $value) {
                $changes->$field = $value;
            }
        }
        if ((array) $changes) {
            $changes->id = $user->id;
            \core\user::update_user($changes, false);
            $user = $DB->get_record('user', ['id' => $user->id], '*', MUST_EXIST);
        }
        return $user;
    }

    /**
     * Enrols the user in every course with the configured role and puts them in their school's
     * group, so that with "separate groups" teachers see only pupils of their own school.
     *
     * @param stdClass $user
     * @param stdClass $claims
     */
    public static function enrol_everywhere(stdClass $user, stdClass $claims): void {
        global $CFG, $DB;
        require_once($CFG->dirroot . '/group/lib.php');

        $config = get_config('auth_invok');
        if ($claims->role === 'teacher') {
            $roleshortname = trim((string) ($config->teacherrole ?? '')) ?: 'teacher';
        } else {
            $roleshortname = trim((string) ($config->studentrole ?? '')) ?: 'student';
        }
        $roleid = $DB->get_field('role', 'id', ['shortname' => $roleshortname], MUST_EXIST);

        $manual = enrol_get_plugin('manual');
        if (!$manual) {
            throw new moodle_exception('notconfigured', 'auth_invok');
        }

        $groupidnumber = 'invok-school-' . $claims->school->id;
        $groupname = self::name($claims->school->name ?? '', 'Škola');

        $courses = $DB->get_records_select('course', 'id <> ?', [SITEID], 'id', 'id');
        foreach ($courses as $course) {
            $instance = $DB->get_record('enrol', ['courseid' => $course->id, 'enrol' => 'manual'],
                '*', IGNORE_MULTIPLE);
            if (!$instance) {
                $instanceid = $manual->add_default_instance(get_course($course->id));
                $instance = $DB->get_record('enrol', ['id' => $instanceid], '*', MUST_EXIST);
            }

            $context = context_course::instance($course->id);
            $enrolled = $DB->record_exists('user_enrolments', ['enrolid' => $instance->id, 'userid' => $user->id]);
            if (!$enrolled || !user_has_role_assignment($user->id, $roleid, $context->id)) {
                $manual->enrol_user($instance, $user->id, $roleid);
            }

            $group = groups_get_group_by_idnumber($course->id, $groupidnumber);
            if (!$group) {
                $groupid = groups_create_group((object) [
                    'courseid' => $course->id,
                    'name' => $groupname,
                    'idnumber' => $groupidnumber,
                ]);
            } else {
                $groupid = $group->id;
                if ($group->name !== $groupname) {
                    $group->name = $groupname;
                    groups_update_group($group);
                }
            }
            if (!groups_is_member($groupid, $user->id)) {
                groups_add_member($groupid, $user->id);
            }
        }
    }
}
