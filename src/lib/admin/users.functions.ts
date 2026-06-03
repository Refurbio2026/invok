import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "./admin.functions";

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: AppRole[];
  school_id: string | null;
  school_name: string | null;
};

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Načítaj všetkých auth používateľov (max 1000 stačí)
    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersErr) throw new Error(usersErr.message);

    const userIds = usersData.users.map((u) => u.id);
    if (userIds.length === 0) return [] as AdminUserRow[];

    const [{ data: rolesRows }, { data: profileRows }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id, role, school_id").in("user_id", userIds),
      supabaseAdmin.from("profiles").select("id, full_name, school_id").in("id", userIds),
    ]);

    const schoolIds = Array.from(
      new Set(
        [
          ...(rolesRows ?? []).map((r) => r.school_id),
          ...(profileRows ?? []).map((p) => p.school_id),
        ].filter((v): v is string => !!v),
      ),
    );
    const { data: schoolsRows } = schoolIds.length
      ? await supabaseAdmin.from("schools").select("id, name").in("id", schoolIds)
      : { data: [] as { id: string; name: string }[] };
    const schoolMap = new Map((schoolsRows ?? []).map((s) => [s.id, s.name]));

    const rolesByUser = new Map<string, { roles: AppRole[]; school_id: string | null }>();
    for (const r of rolesRows ?? []) {
      const cur = rolesByUser.get(r.user_id) ?? { roles: [], school_id: null };
      cur.roles.push(r.role as AppRole);
      if (r.school_id) cur.school_id = r.school_id;
      rolesByUser.set(r.user_id, cur);
    }
    const profileByUser = new Map(
      (profileRows ?? []).map((p) => [p.id, p]),
    );

    return usersData.users
      .map<AdminUserRow>((u) => {
        const r = rolesByUser.get(u.id) ?? { roles: [], school_id: null };
        const p = profileByUser.get(u.id);
        const schoolId = r.school_id ?? p?.school_id ?? null;
        return {
          id: u.id,
          email: u.email ?? null,
          full_name: p?.full_name ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          roles: r.roles,
          school_id: schoolId,
          school_name: schoolId ? schoolMap.get(schoolId) ?? null : null,
        };
      })
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  });
