// Server-only: signs one-time login links for Moodle (lms.invok.pscno.sk).
// The Moodle side is lms/moodle/auth/invok (auth_invok); the format must match
// auth_invok\local\sso::verify(): "<base64url(JSON)>.<base64url(HMAC-SHA256(secret, payload))>".
import process from "node:process";

export type LmsRole = "student" | "teacher";

export type LmsIdentity = {
  role: LmsRole;
  uid: string;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  school: { id: string; name: string };
};

/** How long a link stays valid. Moodle rejects anything over 300 s. */
const LIFETIME_S = 60;

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function lmsConfig() {
  // Read per request (see config.server.ts).
  const url = (process.env.INVOK_LMS_URL ?? "https://lms.invok.pscno.sk").replace(/\/+$/, "");
  const secret = process.env.INVOK_LMS_SECRET ?? "";
  if (secret.length < 32) throw new Error("Vstup do LMS zatiaľ nie je nastavený. Kontaktujte administrátora.");
  return { url, secret };
}

export async function signLmsToken(identity: LmsIdentity, secret: string, now = Date.now()) {
  const iat = Math.floor(now / 1000);
  const payload = {
    v: 1,
    jti: base64url(crypto.getRandomValues(new Uint8Array(24))),
    iat,
    exp: iat + LIFETIME_S,
    role: identity.role,
    uid: identity.uid,
    fn: identity.firstName ?? "",
    ln: identity.lastName ?? "",
    ...(identity.email ? { email: identity.email } : {}),
    school: identity.school,
  };
  const enc = new TextEncoder();
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64)));
  return `${payloadB64}.${base64url(signature)}`;
}

export async function createLmsLoginUrl(identity: LmsIdentity) {
  const { url, secret } = lmsConfig();
  const token = await signLmsToken(identity, secret);
  return `${url}/auth/invok/login.php?t=${encodeURIComponent(token)}`;
}

/** "Mgr. Jana Nováková" -> { firstName: "Mgr. Jana", lastName: "Nováková" } */
export function splitFullName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}
