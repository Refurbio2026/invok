import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase as browserSupabase } from "@/integrations/supabase/client";

export const BLOG_STATUSES = ["draft", "published", "archived"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  category?: BlogCategory | null;
  author: string;
  status: BlogStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function assertAdminish(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "koordinator"])
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

// =============== CATEGORIES ===============

export const listBlogCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data as BlogCategory[];
  },
);

export const saveBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(120),
        slug: z.string().min(1).max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const slug = slugify(data.slug || data.name);
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("blog_categories")
        .update({ name: data.name, slug })
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("blog_categories")
      .insert({ name: data.name, slug })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("blog_categories")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =============== POSTS (admin) ===============

export const listBlogPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*, category:blog_categories(id,name,slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as BlogPost[];
  });

export const getBlogPostAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*, category:blog_categories(id,name,slug)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row as BlogPost;
  });

const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  slug: z.string().max(120).optional(),
  excerpt: z.string().max(1000).nullable().optional(),
  content: z.string().default(""),
  cover_image_url: z.string().url().nullable().optional().or(z.literal("")),
  category_id: z.string().uuid().nullable().optional(),
  author: z.string().min(1).max(120).default("Tím INVOK"),
  status: z.enum(BLOG_STATUSES).default("draft"),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
});

export const saveBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => postSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const baseSlug = slugify(data.slug || data.title);
    let slug = baseSlug || `clanok-${Date.now()}`;
    // Ensure unique slug
    const { data: dup } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (dup && (!data.id || dup.id !== data.id)) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const payload: any = {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content ?? "",
      cover_image_url: data.cover_image_url || null,
      category_id: data.category_id || null,
      author: data.author || "Tím INVOK",
      status: data.status,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
    };

    if (data.status === "published") {
      // set published_at if not previously published
      if (data.id) {
        const { data: prev } = await supabaseAdmin
          .from("blog_posts")
          .select("published_at")
          .eq("id", data.id)
          .single();
        payload.published_at = prev?.published_at || new Date().toISOString();
      } else {
        payload.published_at = new Date().toISOString();
      }
    }

    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("blog_posts")
        .update(payload)
        .eq("id", data.id)
        .select("*, category:blog_categories(id,name,slug)")
        .single();
      if (error) throw new Error(error.message);
      return row as BlogPost;
    }

    payload.created_by = context.userId;
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .insert(payload)
      .select("*, category:blog_categories(id,name,slug)")
      .single();
    if (error) throw new Error(error.message);
    return row as BlogPost;
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =============== PUBLIC reads (browser, RLS-respecting) ===============

export async function fetchPublicPosts(): Promise<BlogPost[]> {
  const { data, error } = await browserSupabase
    .from("blog_posts")
    .select("*, category:blog_categories(id,name,slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as BlogPost[];
}

export async function fetchPublicPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const { data, error } = await browserSupabase
    .from("blog_posts")
    .select("*, category:blog_categories(id,name,slug)")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BlogPost) || null;
}

export async function fetchPublicCategories(): Promise<BlogCategory[]> {
  const { data, error } = await browserSupabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as BlogCategory[];
}
