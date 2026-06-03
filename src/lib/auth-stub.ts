// Placeholder auth helpers. Replace internals with Supabase Auth later.
// Keep this interface stable so call sites don't need to change.

export type UserRole = "admin" | "skola" | "ucitel" | "ziak";

export type LoginPayload = {
  role: UserRole;
  email?: string;
  identifier?: string;
  password?: string;
  schoolCode?: string;
  classCode?: string;
  studentCode?: string;
  pin?: string;
};

export async function loginStub(payload: LoginPayload): Promise<{ ok: true }> {
  // TODO: napojiť na Supabase Auth
  await new Promise((r) => setTimeout(r, 400));
  // eslint-disable-next-line no-console
  console.info("[auth-stub] login", payload.role);
  return { ok: true };
}

export async function registerSchoolStub(data: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 400));
  // eslint-disable-next-line no-console
  console.info("[auth-stub] register school", data);
  return { ok: true as const };
}

export function dashboardPathFor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "skola":
      return "/skola/dashboard";
    case "ucitel":
      return "/ucitel/dashboard";
    case "ziak":
      return "/ziak/dashboard";
  }
}
