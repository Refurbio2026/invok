import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  title_hu: string;
  excerpt_hu: string;
  content_hu: string;
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
  title_hu: "",
  excerpt_hu: "",
  content_hu: "",
  cover_image_url: "",
  category_id: "",
  author: "Tím INVOK",
  status: "draft",
  seo_title: "",
  seo_description: "",
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
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (post.data) {
      setForm({
        title: post.data.title || "",
        slug: post.data.slug || "",
        excerpt: post.data.excerpt || "",
        content: post.data.content || "",
        title_hu: post.data.title_hu || "",
        excerpt_hu: post.data.excerpt_hu || "",
        content_hu: post.data.content_hu || "",
        cover_image_url: post.data.cover_image_url || "",
        category_id: post.data.category_id || "",
        author: post.data.author || "Tím INVOK",
        status: post.data.status || "draft",
        seo_title: post.data.seo_title || "",
        seo_description: post.data.seo_description || "",
      });
      setSlugTouched(true);
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
          title_hu: form.title_hu || null,
          excerpt_hu: form.excerpt_hu || null,
          content_hu: form.content_hu || null,
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
        setForm((f) => ({ ...f, status: row.status, slug: row.slug }));
      }
    },
    onError: (e: any) => toast.error(e?.message || "Chyba pri ukladaní."),
  });

  const update = (k: keyof FormState, v: string) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "title" && !slugTouched) {
        next.slug = slugify(v);
      }
      return next;
    });

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
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value);
                }}
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

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <h3 className="font-semibold text-sm">Maďarská verzia (HU)</h3>
              <p className="text-xs text-muted-foreground">Ak polia necháte prázdne, maďarskí návštevníci uvidia slovenský text.</p>
              <div>
                <Label>Názov (HU)</Label>
                <Input value={form.title_hu} onChange={(e) => update("title_hu", e.target.value)} maxLength={300} />
              </div>
              <div>
                <Label>Perex (HU)</Label>
                <Textarea value={form.excerpt_hu} onChange={(e) => update("excerpt_hu", e.target.value)} rows={3} maxLength={1000} />
              </div>
              <div>
                <Label>Obsah článku (HU)</Label>
                <RichEditor value={form.content_hu} onChange={(v) => update("content_hu", v)} />
              </div>
            </div>
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
              {form.cover_image_url ? (
                <img
                  src={form.cover_image_url}
                  alt=""
                  className="rounded-lg w-full aspect-video object-cover border border-border"
                />
              ) : (
                <div className="rounded-lg w-full aspect-video bg-muted flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border">
                  Bez obrázka
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <ImagePickerDialog
                  title="Titulný obrázok"
                  onPick={(img) => update("cover_image_url", img.url)}
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      {form.cover_image_url ? "Zmeniť obrázok" : "Vybrať obrázok"}
                    </Button>
                  }
                />
                {form.cover_image_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => update("cover_image_url", "")}
                  >
                    Odstrániť
                  </Button>
                )}
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">
                  Alebo zadať URL ručne
                </summary>
                <Input
                  value={form.cover_image_url}
                  onChange={(e) => update("cover_image_url", e.target.value)}
                  placeholder="https://…"
                  className="mt-2"
                />
              </details>
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

// ============= WYSIWYG editor (TipTap) =============

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";

function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noreferrer", target: "_blank" },
      }),
      ImageExt.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[420px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value (e.g. after fetch) into editor without breaking cursor.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const linkAction = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = prompt("URL odkazu (https://…)", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const [pendingImg, setPendingImg] = useState<PickedImage | null>(null);
  const [imgAlt, setImgAlt] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [imgSize, setImgSize] = useState<"small" | "medium" | "large" | "full">(
    "large",
  );

  const onPickImage = (img: PickedImage) => {
    setPendingImg(img);
    setImgAlt(img.alt || "");
    setImgCaption(img.caption || "");
    setImgSize("large");
  };

  const insertConfiguredImage = () => {
    if (!pendingImg || !editor) return;
    const sizeClass = {
      small: "max-w-xs",
      medium: "max-w-md",
      large: "max-w-2xl",
      full: "w-full",
    }[imgSize];
    const altAttr = escapeHtml(imgAlt || "");
    const captionHtml = imgCaption
      ? `<figcaption>${escapeHtml(imgCaption)}</figcaption>`
      : "";
    const html = `<figure class="article-figure ${sizeClass}"><img src="${pendingImg.url}" alt="${altAttr}" loading="lazy" />${captionHtml}</figure><p></p>`;
    editor.chain().focus().insertContent(html).run();
    setPendingImg(null);
    setImgAlt("");
    setImgCaption("");
  };

  const isActive = (name: string, attrs?: Record<string, any>) =>
    !!editor && editor.isActive(name, attrs as any);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/40">
        <ToolBtn
          active={isActive("heading", { level: 1 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Nadpis H1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={isActive("heading", { level: 2 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Nadpis H2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={isActive("heading", { level: 3 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Nadpis H3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={isActive("paragraph")}
          onClick={() => editor?.chain().focus().setParagraph().run()}
          title="Odsek"
        >
          <Type className="h-4 w-4" />
        </ToolBtn>
        <span className="w-px bg-border mx-1" />
        <ToolBtn
          active={isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Tučné"
        >
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Kurzíva"
        >
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={isActive("link")} onClick={linkAction} title="Odkaz">
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>
        <span className="w-px bg-border mx-1" />
        <ToolBtn
          active={isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Zoznam"
        >
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Číslovaný zoznam"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Citácia"
        >
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <ImagePickerDialog
          title="Vložiť obrázok do článku"
          onPick={onPickImage}
          trigger={
            <button
              type="button"
              title="Vložiť obrázok"
              className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted text-foreground"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          }
        />
      </div>

      <EditorContent editor={editor} />

      <Dialog
        open={!!pendingImg}
        onOpenChange={(o) => {
          if (!o) setPendingImg(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vlastnosti obrázka</DialogTitle>
          </DialogHeader>
          {pendingImg && (
            <div className="space-y-3">
              <img
                src={pendingImg.url}
                alt={imgAlt}
                className="w-full max-h-48 object-contain rounded-lg border border-border bg-muted"
              />
              <div>
                <Label>Alternatívny text</Label>
                <Input
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  placeholder="Popis pre prístupnosť"
                />
              </div>
              <div>
                <Label>Titulok pod obrázkom</Label>
                <Input
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  placeholder="Voliteľný titulok"
                />
              </div>
              <div>
                <Label>Veľkosť</Label>
                <Select
                  value={imgSize}
                  onValueChange={(v) => setImgSize(v as typeof imgSize)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Malá</SelectItem>
                    <SelectItem value="medium">Stredná</SelectItem>
                    <SelectItem value="large">Veľká</SelectItem>
                    <SelectItem value="full">Na celú šírku</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPendingImg(null)}>
                  Zrušiť
                </Button>
                <Button onClick={insertConfiguredImage}>Vložiť do článku</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ToolBtn({
  onClick,
  title,
  children,
  active,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        "h-8 w-8 inline-flex items-center justify-center rounded text-foreground " +
        (active ? "bg-muted" : "hover:bg-muted")
      }
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
