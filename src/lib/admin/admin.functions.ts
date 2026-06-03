import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type AppRole = "admin" | "editor" | "koordinator" | "viewer" | "skola";

// Vráti role aktuálneho používateľa (bezpečne, podľa RLS)
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, school_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return {
      userId,
      roles: (data ?? []).map((r) => r.role as AppRole),
      schoolId: data?.[0]?.school_id ?? null,
    };
  });

// Bootstrap: ak ešte nie je žiadny admin, priradí aktuálnemu používateľovi rolu admin.
// Volá sa po prvom prihlásení v /admin/prihlasenie.
export const claimAdminIfFirst = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cntErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cntErr) throw new Error(cntErr.message);
    if ((count ?? 0) > 0) return { granted: false as const };
    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (insErr) throw new Error(insErr.message);
    await supabaseAdmin.from("activity_log").insert({
      user_id: userId,
      action: "bootstrap_admin",
      module: "auth",
      description: "Prvý admin účet vytvorený bootstrapom.",
    });
    return { granted: true as const };
  });

// Štatistiky pre admin dashboard
export const getAdminStats = createServerFn({ method: "GET" })
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
    const [schools, activeSchools, pendingRequests] = await Promise.all([
      supabaseAdmin.from("schools").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("schools")
        .select("id", { count: "exact", head: true })
        .eq("status", "aktivna"),
      supabaseAdmin
        .from("school_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "nova"),
    ]);
    return {
      schools: schools.count ?? 0,
      activeSchools: activeSchools.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
    };
  });

// Žiadosti škôl pre admin tabuľku
export const listSchoolRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("school_requests")
      .select(
        "id,name,city,region,contact_name,contact_email,contact_phone,status,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Schválenie žiadosti → vytvorí školu + (voliteľne) účet
export const approveSchoolRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        requestId: z.string().uuid(),
        createAccount: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    // overenie role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "koordinator"])
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error: reqErr } = await supabaseAdmin
      .from("school_requests")
      .select("*")
      .eq("id", data.requestId)
      .single();
    if (reqErr || !req) throw new Error("Žiadosť nenájdená");
    if (req.status === "schvalena") throw new Error("Žiadosť je už schválená");

    const { data: school, error: schErr } = await supabaseAdmin
      .from("schools")
      .insert({
        name: req.name,
        type: req.type,
        ico: req.ico,
        dic: req.dic,
        street: req.street,
        city: req.city,
        zip: req.zip,
        region: req.region,
        website: req.website,
        contact_name: req.contact_name,
        contact_position: req.contact_position,
        contact_email: req.contact_email,
        contact_phone: req.contact_phone,
        status: "schvalena",
      })
      .select("id")
      .single();
    if (schErr || !school) throw new Error(schErr?.message ?? "Chyba pri vytvorení školy");

    let invitedEmail: string | null = null;
    if (data.createAccount && req.contact_email) {
      const { data: invite, error: invErr } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(req.contact_email, {
          data: {
            full_name: req.contact_name,
            school_id: school.id,
          },
        });
      if (!invErr && invite.user) {
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: invite.user.id, role: "skola", school_id: school.id });
        await supabaseAdmin
          .from("profiles")
          .update({ school_id: school.id })
          .eq("id", invite.user.id);
        invitedEmail = req.contact_email;
      }
    }

    await supabaseAdmin
      .from("school_requests")
      .update({
        status: "schvalena",
        processed_by: userId,
        processed_at: new Date().toISOString(),
        school_id: school.id,
      })
      .eq("id", req.id);

    await supabaseAdmin.from("activity_log").insert({
      user_id: userId,
      action: "approve_school_request",
      module: "schools",
      description: `Schválená žiadosť školy ${req.name}`,
      metadata: { school_id: school.id, invitedEmail },
    });

    return { schoolId: school.id, invitedEmail };
  });

export const rejectSchoolRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ requestId: z.string().uuid(), note: z.string().max(1000).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "koordinator"])
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("school_requests")
      .update({
        status: "zamietnuta",
        internal_note: data.note ?? null,
        processed_by: userId,
        processed_at: new Date().toISOString(),
      })
      .eq("id", data.requestId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Zoznam škôl
export const listSchools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,type,city,region,contact_name,contact_email,contact_phone,status,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
