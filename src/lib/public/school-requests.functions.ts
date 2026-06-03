import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitSchoolRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(2).max(200),
        type: z
          .enum(["zakladna", "stredna", "gymnazium", "sou", "spojena", "ina"])
          .optional(),
        ico: z.string().max(20).optional(),
        dic: z.string().max(20).optional(),
        street: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        zip: z.string().max(20).optional(),
        region: z.string().max(100).optional(),
        website: z.string().max(200).optional(),
        contact_name: z.string().min(2).max(120),
        contact_position: z.string().max(120).optional(),
        contact_email: z.string().email().max(255),
        contact_phone: z.string().max(40).optional(),
        students_count: z.number().int().nonnegative().optional(),
        classes_count: z.number().int().nonnegative().optional(),
        interested_in_testing: z.boolean().default(true),
        note: z.string().max(2000).optional(),
        gdpr_consent: z.literal(true),
        contact_consent: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error, data: row } = await supabaseAdmin
      .from("school_requests")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("activity_log").insert({
      action: "submit_school_request",
      module: "school_requests",
      description: `Nová žiadosť školy: ${data.name}`,
      metadata: { request_id: row.id },
    });
    return { ok: true as const };
  });
