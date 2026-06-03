import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GalleryImage = {
  id: string;
  storage_path: string;
  url: string;
  filename: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  content_type: string | null;
  created_at: string;
};

async function assertAdminish(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "koordinator"])
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

// 10 years
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export const listGalleryImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data || []) as GalleryImage[];
  });

export const registerGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        storage_path: z.string().min(1),
        filename: z.string().min(1).max(255),
        alt: z.string().max(300).nullable().optional(),
        caption: z.string().max(500).nullable().optional(),
        size_bytes: z.number().int().nonnegative().optional(),
        content_type: z.string().max(120).optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("gallery")
      .createSignedUrl(data.storage_path, SIGNED_URL_TTL);
    if (sErr || !signed?.signedUrl) {
      throw new Error(sErr?.message || "Cannot create signed URL");
    }

    const { data: row, error } = await supabaseAdmin
      .from("gallery_images")
      .insert({
        storage_path: data.storage_path,
        url: signed.signedUrl,
        filename: data.filename,
        alt: data.alt || null,
        caption: data.caption || null,
        size_bytes: data.size_bytes ?? null,
        content_type: data.content_type ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        uploaded_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as GalleryImage;
  });

export const updateGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        alt: z.string().max(300).nullable().optional(),
        caption: z.string().max(500).nullable().optional(),
        filename: z.string().min(1).max(255).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const patch: any = {};
    if (data.alt !== undefined) patch.alt = data.alt;
    if (data.caption !== undefined) patch.caption = data.caption;
    if (data.filename !== undefined) patch.filename = data.filename;
    const { data: row, error } = await supabaseAdmin
      .from("gallery_images")
      .update(patch)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as GalleryImage;
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: img } = await supabaseAdmin
      .from("gallery_images")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (img?.storage_path) {
      await supabaseAdmin.storage.from("gallery").remove([img.storage_path]);
    }
    const { error } = await supabaseAdmin
      .from("gallery_images")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
