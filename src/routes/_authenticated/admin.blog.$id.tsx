import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ImagePickerDialog,
  type PickedImage,
} from "@/components/invok/admin/ImagePickerDialog";
import {
  getBlogPostAdmin,
  listBlogCategories,
  saveBlogPost,
  type BlogStatus,
} from "@/lib/admin/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  component: BlogEditor,
});

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  author: string;
  status: BlogStatus;
  seo_title: string;
  seo_description: string;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category_id: "",
  author: "Tím INVOK",
  status: "draft",
  seo_title: "",
  seo_description: "",
};

function BlogEditor() {
  const { id } = Route.useParams();
  const isNew = id === "novy";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const getFn = useServerFn(getBlogPostAdmin);
  const saveFn = useServerFn(saveBlogPost);
  const catFn = useServerFn(listBlogCategories);

  const categories = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => catFn(),
  });

  const post = useQuery({
    queryKey: ["admin-blog", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !isNew,
  });

  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (post.data) {
      setForm({
        title: post.data.title || "",
        slug: post.data.slug || "",
        excerpt: post.data.excerpt || "",
        content: post.data.content || "",
        cover_image_url: post.data.cover_image_url || "",
        category_id: post.data.category_id || "",
        author: post.data.author || "Tím INVOK",
        status: post.data.status || "draft",
        seo_title: post.data.seo_title || "",
        seo_description: post.data.seo_description || "",
      });
    }
  }, [post.data]);

  const saveMut = useMutation({
    mutationFn: (status?: BlogStatus) =>
      saveFn({
        data: {
          id: isNew ? undefined : id,
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || null,
          content: form.content,
          cover_image_url: form.cover_image_url || null,
          category_id: form.category_id || null,
          author: form.author,
          status: status || form.status,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        },
      }),
    onSuccess: (row) => {
      toast.success(
        form.status === "published" || row.status === "published"
          ? "Publikované."
          : "Uložené.",
      );
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      qc.invalidateQueries({ queryKey: ["public-blog"] });
      if (isNew) {
        navigate({ to: "/admin/blog/$id", params: { id: row.id } });
      } else {
        setForm((f) => ({ ...f, status: row.status }));
      }
    },
    onError: (e: any) => toast.error(e?.message || "Chyba pri ukladaní."),
  });

  const update = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (!isNew && post.isLoading) {
    return (
      <AdminLayout title="Blog">
        <div className="p-10 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Blog">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/blog">
              <ArrowLeft className="h-4 w-4 mr-2" /> Späť na zoznam
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => saveMut.mutate(form.status)}
              disabled={!form.title || saveMut.isPending}
            >
              <Save className="h-4 w-4 mr-2" /> Uložiť ako koncept
            </Button>
            <Button
              onClick={() => saveMut.mutate("published")}
              disabled={!form.title || saveMut.isPending}
            >
              {form.status === "published" ? "Aktualizovať publikovaný" : "Publikovať"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main editor */}
          <div className="space-y-4">
            <div>
              <Label>Názov článku *</Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Napríklad: Prečo školy potrebujú kompetencie 21. storočia"
                className="text-lg"
              />
            </div>

            <div>
              <Label>Slug URL</Label>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="auto-generovaný z názvu, ak prázdne"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Verejná URL: <code>/novinky/{form.slug || "(auto)"}</code>
              </p>
            </div>

            <div>
              <Label>Perex (krátky úvod)</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                rows={3}
                maxLength={1000}
              />
            </div>

            <Tabs defaultValue="edit">
              <div className="flex items-center justify-between">
                <Label>Obsah článku</Label>
                <TabsList>
                  <TabsTrigger value="edit">Editor</TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-1" /> Náhľad
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="edit" className="mt-2">
                <RichEditor
                  value={form.content}
                  onChange={(v) => update("content", v)}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <ArticlePreview
                  title={form.title}
                  excerpt={form.excerpt}
                  cover={form.cover_image_url}
                  content={form.content}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-sm">Nastavenia</h3>
              <div>
                <Label>Stav</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => update("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="published">Publikovaný</SelectItem>
                    <SelectItem value="archived">Archivovaný</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategória</Label>
                <Select
                  value={form.category_id || "none"}
                  onValueChange={(v) =>
                    update("category_id", v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bez kategórie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— bez kategórie —</SelectItem>
                    {(categories.data || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Autor</Label>
                <Input
                  value={form.author}
                  onChange={(e) => update("author", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-sm">Titulný obrázok</h3>
              <Input
                value={form.cover_image_url}
                onChange={(e) => update("cover_image_url", e.target.value)}
                placeholder="https://…"
              />
              {form.cover_image_url && (
                <img
                  src={form.cover_image_url}
                  alt=""
                  className="rounded-lg w-full aspect-video object-cover border border-border"
                />
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-sm">SEO</h3>
              <div>
                <Label>SEO title</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => update("seo_title", e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <Label>SEO description</Label>
                <Textarea
                  value={form.seo_description}
                  onChange={(e) => update("seo_description", e.target.value)}
                  rows={3}
                  maxLength={400}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ Rich text editor (HTML-based, simple toolbar) ============

function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after: string = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    });
  };

  const insertBlock = (tpl: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const next = value.slice(0, start) + tpl + value.slice(start);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tpl.length;
    });
  };

  const linkAction = () => {
    const url = prompt("URL odkazu (https://…)");
    if (!url) return;
    wrap(`<a href="${url}" target="_blank" rel="noreferrer">`, "</a>");
  };

  const imgAction = () => {
    const url = prompt("URL obrázka (https://…)");
    if (!url) return;
    const alt = prompt("Alt text (popis obrázka)", "") || "";
    insertBlock(`\n<img src="${url}" alt="${alt}" />\n`);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/40">
        <ToolBtn onClick={() => wrap("<h1>", "</h1>")} title="Nadpis H1">
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrap("<h2>", "</h2>")} title="Nadpis H2">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrap("<h3>", "</h3>")} title="Nadpis H3">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => insertBlock("\n<p>Odsek…</p>\n")} title="Odsek">
          <Type className="h-4 w-4" />
        </ToolBtn>
        <span className="w-px bg-border mx-1" />
        <ToolBtn onClick={() => wrap("<strong>", "</strong>")} title="Tučné">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrap("<em>", "</em>")} title="Kurzíva">
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={linkAction} title="Odkaz">
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>
        <span className="w-px bg-border mx-1" />
        <ToolBtn
          onClick={() =>
            insertBlock(
              "\n<ul>\n  <li>Položka 1</li>\n  <li>Položka 2</li>\n</ul>\n",
            )
          }
          title="Zoznam"
        >
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            insertBlock(
              "\n<ol>\n  <li>Krok 1</li>\n  <li>Krok 2</li>\n</ol>\n",
            )
          }
          title="Číslovaný zoznam"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => wrap("<blockquote>", "</blockquote>")}
          title="Citácia"
        >
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={imgAction} title="Obrázok">
          <ImageIcon className="h-4 w-4" />
        </ToolBtn>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Napíšte obsah článku v HTML. Použite tlačidlá hore na vloženie nadpisov, zoznamov, citácií a obrázkov."
        className="min-h-[420px] border-0 rounded-none font-mono text-sm focus-visible:ring-0"
      />
    </div>
  );
}

function ToolBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted text-foreground"
    >
      {children}
    </button>
  );
}

function ArticlePreview({
  title,
  excerpt,
  cover,
  content,
}: {
  title: string;
  excerpt: string;
  cover: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {cover && (
        <div className="aspect-[21/9] bg-muted">
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {title || "Bez názvu"}
        </h1>
        {excerpt && (
          <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>
        )}
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: content || "<p><em>Žiadny obsah.</em></p>" }}
        />
      </div>
    </div>
  );
}
