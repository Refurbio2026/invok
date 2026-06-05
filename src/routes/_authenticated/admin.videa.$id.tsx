import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  PlayCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImagePickerDialog,
  type PickedImage,
} from "@/components/invok/admin/ImagePickerDialog";
import {
  getVideoAdmin,
  saveVideo,
  listVideoCategories,
  createUploadUrl,
  finalizeUploadedVideo,
  type Video,
} from "@/lib/admin/videos.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/videa/$id")({
  component: VideoEditor,
});

type SourceType = "upload" | "youtube" | "vimeo" | "url";

type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string | null;
  grade: string;
  author: string;
  source_type: SourceType;
  source_url: string;
  storage_path: string | null;
  thumbnail_url: string;
  duration_seconds: string;
  status: "draft" | "published" | "archived";
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  category_id: null,
  grade: "",
  author: "Tím INVOK",
  source_type: "youtube",
  source_url: "",
  storage_path: null,
  thumbnail_url: "",
  duration_seconds: "",
  status: "draft",
};

function detectSource(url: string): { type: SourceType; embed?: string } {
  const u = url.trim();
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (yt) return { type: "youtube", embed: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", embed: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "url" };
}

function VideoEditor() {
  const { id } = Route.useParams();
  const isNew = id === "nove";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const getFn = useServerFn(getVideoAdmin);
  const saveFn = useServerFn(saveVideo);
  const catFn = useServerFn(listVideoCategories);
  const uploadUrlFn = useServerFn(createUploadUrl);
  const finalizeFn = useServerFn(finalizeUploadedVideo);

  const categories = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => catFn(),
  });

  const existing = useQuery({
    queryKey: ["admin-video", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !isNew,
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing.data) {
      const v = existing.data;
      setForm({
        title: v.title,
        slug: v.slug,
        description: v.description || "",
        category_id: v.category_id,
        grade: v.grade?.toString() || "",
        author: v.author,
        source_type: v.source_type,
        source_url: v.source_url || "",
        storage_path: v.storage_path,
        thumbnail_url: v.thumbnail_url || "",
        duration_seconds: v.duration_seconds?.toString() || "",
        status: v.status,
      });
    }
  }, [existing.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: isNew ? undefined : id,
          title: form.title.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || null,
          category_id: form.category_id,
          grade: form.grade ? parseInt(form.grade, 10) : null,
          author: form.author.trim() || "Tím INVOK",
          source_type: form.source_type,
          source_url: form.source_url.trim() || null,
          storage_path: form.storage_path,
          thumbnail_url: form.thumbnail_url.trim() || null,
          duration_seconds: form.duration_seconds
            ? parseInt(form.duration_seconds, 10)
            : null,
          status: form.status,
        },
      }),
    onSuccess: (v: Video) => {
      toast.success("Uložené.");
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
      qc.invalidateQueries({ queryKey: ["admin-video"] });
      if (isNew) navigate({ to: "/admin/videa/$id", params: { id: v.id } });
    },
    onError: (e: any) => toast.error(e?.message || "Chyba pri ukladaní."),
  });

  const onFile = async (file: File) => {
    if (!file) return;
    const ok = ["video/mp4", "video/quicktime", "video/webm"];
    if (!ok.includes(file.type)) {
      toast.error("Podporované formáty: MP4, MOV, WebM.");
      return;
    }
    setUploading(true);
    try {
      const { path, token } = await uploadUrlFn({
        data: { filename: file.name, content_type: file.type },
      });
      const { error } = await supabase.storage
        .from("videos")
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw error;
      const { url } = await finalizeFn({ data: { storage_path: path } });

      // try detect duration via temporary video element
      const tmp = document.createElement("video");
      tmp.preload = "metadata";
      tmp.src = URL.createObjectURL(file);
      const duration = await new Promise<number | null>((resolve) => {
        tmp.onloadedmetadata = () => resolve(Math.round(tmp.duration) || null);
        tmp.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 5000);
      });

      setForm((f) => ({
        ...f,
        source_type: "upload",
        storage_path: path,
        source_url: url,
        duration_seconds: duration ? duration.toString() : f.duration_seconds,
      }));
      toast.success("Video nahrané.");
    } catch (e: any) {
      toast.error(e?.message || "Nahratie zlyhalo.");
    } finally {
      setUploading(false);
    }
  };

  const onUrlChange = (url: string) => {
    const det = detectSource(url);
    setForm((f) => ({
      ...f,
      source_url: url,
      source_type: det.type,
      storage_path: null,
    }));
  };

  if (!isNew && existing.isLoading) {
    return (
      <AdminLayout title="Video">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? "Nové video" : form.title || "Video"}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/videa">
              <ArrowLeft className="h-4 w-4 mr-2" /> Späť na zoznam
            </Link>
          </Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Uložiť
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <Label>Názov videa *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Napr. Úvod do podnikateľského myslenia"
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generovaný z názvu"
                />
              </div>
              <div>
                <Label>Krátky popis</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <h2 className="font-semibold">Zdroj videa</h2>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Nahrať z počítača (MP4, MOV, WebM)
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                    e.target.value = "";
                  }}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Alebo vložiť URL (YouTube,
                  Vimeo, priame video)
                </Label>
                <Input
                  value={form.source_type === "upload" ? "" : form.source_url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  disabled={form.source_type === "upload"}
                />
                {form.source_type === "upload" && form.storage_path && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Nahraté video: {form.storage_path}
                  </p>
                )}
              </div>

              {form.source_url && (
                <div className="rounded-lg overflow-hidden border border-border bg-black">
                  <VideoPreview
                    type={form.source_type}
                    url={form.source_url}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <Label>Stav</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: any) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="published">Publikované</SelectItem>
                    <SelectItem value="archived">Archivované</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategória</Label>
                <Select
                  value={form.category_id ?? "none"}
                  onValueChange={(v) =>
                    setForm({ ...form, category_id: v === "none" ? null : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bez kategórie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bez kategórie</SelectItem>
                    {(categories.data || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ročník</Label>
                <Input
                  type="number"
                  min={1}
                  max={13}
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                />
              </div>
              <div>
                <Label>Autor</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
              <div>
                <Label>Dĺžka videa (sekundy)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.duration_seconds}
                  onChange={(e) =>
                    setForm({ ...form, duration_seconds: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Thumbnail
              </Label>
              {form.thumbnail_url ? (
                <img
                  src={form.thumbnail_url}
                  alt=""
                  className="w-full aspect-video object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="w-full aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <PlayCircle className="h-8 w-8" />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPickerOpen(true)}
                >
                  Vybrať z Fotogalérie
                </Button>
                {form.thumbnail_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm({ ...form, thumbnail_url: "" })}
                  >
                    Odstrániť
                  </Button>
                )}
              </div>
              <Input
                value={form.thumbnail_url}
                onChange={(e) =>
                  setForm({ ...form, thumbnail_url: e.target.value })
                }
                placeholder="alebo URL obrázka"
              />
            </div>
          </div>
        </div>

        <ImagePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onPick={(img: PickedImage) => {
            setForm((f) => ({ ...f, thumbnail_url: img.url }));
            setPickerOpen(false);
          }}
        />
      </div>
    </AdminLayout>
  );
}

function VideoPreview({ type, url }: { type: SourceType; url: string }) {
  if (type === "youtube") {
    const det = detectSource(url);
    if (det.embed)
      return (
        <iframe
          src={det.embed}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
  }
  if (type === "vimeo") {
    const det = detectSource(url);
    if (det.embed)
      return (
        <iframe
          src={det.embed}
          className="w-full aspect-video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
  }
  return (
    <video src={url} controls className="w-full aspect-video bg-black">
      Váš prehliadač nepodporuje prehrávanie videa.
    </video>
  );
}
