import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type VideoCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Video = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  module_id: string | null;
  grade: number | null;
  author: string;
  source_type: "upload" | "youtube" | "vimeo" | "url";
  source_url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; slug: string } | null;
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `video-${Date.now()}`;
}

const SIGNED_TTL = 60 * 60 * 24 * 365 * 5;

// ============ Categories ============

export const listVideoCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("video_categories")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return (data || []) as VideoCategory[];
  },
);

export const saveVideoCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const slug = slugify(data.name);
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("video_categories")
        .update({ name: data.name, slug })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await supabaseAdmin
      .from("video_categories")
      .insert({ name: data.name, slug });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVideoCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("video_categories")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ Videos ============

export const listVideosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("*, category:video_categories(id,name,slug)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data || []) as Video[];
  });

export const getVideoAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("videos")
      .select("*, category:video_categories(id,name,slug)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Video sa nenašlo.");
    // If upload, refresh signed URL
    if (row.source_type === "upload" && row.storage_path) {
      const { data: s } = await supabaseAdmin.storage
        .from("videos")
        .createSignedUrl(row.storage_path, SIGNED_TTL);
      if (s?.signedUrl) row.source_url = s.signedUrl;
    }
    return row as Video;
  });

const VideoInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  description: z.string().max(5000).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  module_id: z.string().uuid().nullable().optional(),
  grade: z.number().int().min(1).max(13).nullable().optional(),
  author: z.string().min(1).max(120),
  source_type: z.enum(["upload", "youtube", "vimeo", "url"]),
  source_url: z.string().max(2000).nullable().optional(),
  storage_path: z.string().max(500).nullable().optional(),
  thumbnail_url: z.string().max(2000).nullable().optional(),
  duration_seconds: z.number().int().nonnegative().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export const saveVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => VideoInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);

    const patch: any = {
      title: data.title,
      slug,
      description: data.description ?? null,
      category_id: data.category_id ?? null,
      module_id: data.module_id ?? null,
      grade: data.grade ?? null,
      author: data.author,
      source_type: data.source_type,
      source_url: data.source_url ?? null,
      storage_path: data.storage_path ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      duration_seconds: data.duration_seconds ?? null,
      status: data.status,
    };

    if (data.id) {
      // get current to handle published_at transition
      const { data: cur } = await supabaseAdmin
        .from("videos")
        .select("status, published_at")
        .eq("id", data.id)
        .maybeSingle();
      if (data.status === "published" && !cur?.published_at) {
        patch.published_at = new Date().toISOString();
      }
      const { data: row, error } = await supabaseAdmin
        .from("videos")
        .update(patch)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row as Video;
    }

    if (data.status === "published") {
      patch.published_at = new Date().toISOString();
    }
    patch.created_by = context.userId;

    const { data: row, error } = await supabaseAdmin
      .from("videos")
      .insert(patch)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as Video;
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: v } = await supabaseAdmin
      .from("videos")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (v?.storage_path) {
      await supabaseAdmin.storage.from("videos").remove([v.storage_path]);
    }
    const { error } = await supabaseAdmin.from("videos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: src, error } = await supabaseAdmin
      .from("videos")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !src) throw new Error(error?.message || "Video nenájdené.");
    const { id, created_at, updated_at, published_at, ...rest } = src;
    const newTitle = `${src.title} (kópia)`;
    const newSlug = slugify(newTitle + "-" + Date.now().toString(36));
    const { data: row, error: e2 } = await supabaseAdmin
      .from("videos")
      .insert({
        ...rest,
        title: newTitle,
        slug: newSlug,
        status: "draft",
        published_at: null,
        created_by: context.userId,
      })
      .select()
      .single();
    if (e2) throw new Error(e2.message);
    return row as Video;
  });

export const createUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        filename: z.string().min(1).max(255),
        content_type: z.string().max(120),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const ext = data.filename.split(".").pop() || "mp4";
    const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("videos")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message || "Upload URL zlyhalo.");
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const finalizeUploadedVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ storage_path: z.string().min(1) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: s, error } = await supabaseAdmin.storage
      .from("videos")
      .createSignedUrl(data.storage_path, SIGNED_TTL);
    if (error || !s?.signedUrl) throw new Error(error?.message || "Signed URL zlyhalo.");
    return { url: s.signedUrl };
  });

// ============ Public ============

export const listPublishedVideos = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select(
        "id,title,slug,description,thumbnail_url,duration_seconds,published_at,grade,source_type,category:video_categories(id,name,slug)",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data || [];
  },
);
