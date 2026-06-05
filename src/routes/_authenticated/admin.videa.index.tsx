import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search,
  Copy,
  Archive,
  PlayCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listVideosAdmin,
  listVideoCategories,
  saveVideoCategory,
  deleteVideoCategory,
  deleteVideo,
  duplicateVideo,
  saveVideo,
  type Video,
  type VideoCategory,
} from "@/lib/admin/videos.functions";

export const Route = createFileRoute("/_authenticated/admin/videa/")({
  component: VideosAdminPage,
});

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "Koncept", cls: "bg-muted text-foreground" },
  published: {
    label: "Publikované",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  archived: { label: "Archivované", cls: "bg-amber-100 text-amber-900" },
};

function fmtDuration(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VideosAdminPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listVideosAdmin);
  const catFn = useServerFn(listVideoCategories);
  const delFn = useServerFn(deleteVideo);
  const dupFn = useServerFn(duplicateVideo);
  const saveFn = useServerFn(saveVideo);

  const videos = useQuery({ queryKey: ["admin-videos"], queryFn: () => listFn() });
  const categories = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => catFn(),
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (videos.data || []).filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (categoryFilter !== "all" && v.category_id !== categoryFilter) return false;
      if (
        q &&
        !v.title.toLowerCase().includes(q) &&
        !(v.description || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [videos.data, query, statusFilter, categoryFilter]);

  const removeMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Video zmazané.");
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (e: any) => toast.error(e?.message || "Chyba pri mazaní."),
  });

  const dupMut = useMutation({
    mutationFn: (id: string) => dupFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Video duplikované.");
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (e: any) => toast.error(e?.message || "Chyba."),
  });

  const archiveMut = useMutation({
    mutationFn: (v: Video) =>
      saveFn({
        data: {
          id: v.id,
          title: v.title,
          slug: v.slug,
          description: v.description,
          category_id: v.category_id,
          module_id: v.module_id,
          grade: v.grade,
          author: v.author,
          source_type: v.source_type,
          source_url: v.source_url,
          storage_path: v.storage_path,
          thumbnail_url: v.thumbnail_url,
          duration_seconds: v.duration_seconds,
          status: "archived",
        },
      }),
    onSuccess: () => {
      toast.success("Video archivované.");
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (e: any) => toast.error(e?.message || "Chyba."),
  });

  return (
    <AdminLayout title="Videá">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Videá</h1>
            <p className="text-sm text-muted-foreground">
              Centrálna správa vzdelávacích videí pre moduly INVOK.
            </p>
          </div>
          <div className="flex gap-2">
            <CategoriesDialog
              categories={categories.data || []}
              onChanged={() =>
                qc.invalidateQueries({ queryKey: ["video-categories"] })
              }
            />
            <Button asChild>
              <Link to="/admin/videa/$id" params={{ id: "nove" }}>
                <Plus className="h-4 w-4 mr-2" /> Nové video
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa názvu alebo popisu…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky stavy</SelectItem>
              <SelectItem value="draft">Koncept</SelectItem>
              <SelectItem value="published">Publikované</SelectItem>
              <SelectItem value="archived">Archivované</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="md:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky kategórie</SelectItem>
              {(categories.data || []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {videos.isLoading ? (
            <div className="p-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              Žiadne videá. Kliknite na „Nové video“.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium w-32">Thumbnail</th>
                  <th className="px-4 py-3 font-medium">Názov</th>
                  <th className="px-4 py-3 font-medium">Kategória</th>
                  <th className="px-4 py-3 font-medium">Dĺžka</th>
                  <th className="px-4 py-3 font-medium">Vytvorené</th>
                  <th className="px-4 py-3 font-medium">Stav</th>
                  <th className="px-4 py-3 font-medium text-right">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="w-24 aspect-video rounded bg-muted overflow-hidden flex items-center justify-center">
                        {v.thumbnail_url ? (
                          <img
                            src={v.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PlayCircle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div>{v.title}</div>
                      <div className="text-xs text-muted-foreground">
                        /{v.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {v.category?.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDuration(v.duration_seconds)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDate(v.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_LABEL[v.status]?.cls}>
                        {STATUS_LABEL[v.status]?.label || v.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          title="Upraviť"
                        >
                          <Link
                            to="/admin/videa/$id"
                            params={{ id: v.id }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Duplikovať"
                          onClick={() => dupMut.mutate(v.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {v.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Archivovať"
                            onClick={() => archiveMut.mutate(v)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Zmazať"
                          onClick={() => {
                            if (confirm(`Zmazať video "${v.title}"?`))
                              removeMut.mutate(v.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function CategoriesDialog({
  categories,
  onChanged,
}: {
  categories: VideoCategory[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<VideoCategory | null>(null);
  const saveFn = useServerFn(saveVideoCategory);
  const delFn = useServerFn(deleteVideoCategory);

  const saveMut = useMutation({
    mutationFn: (vars: { id?: string; name: string }) => saveFn({ data: vars }),
    onSuccess: () => {
      toast.success("Uložené.");
      setName("");
      setEditing(null);
      onChanged();
    },
    onError: (e: any) => toast.error(e?.message || "Chyba."),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Zmazané.");
      onChanged();
    },
    onError: (e: any) => toast.error(e?.message || "Chyba."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Tag className="h-4 w-4 mr-2" /> Kategórie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Správa kategórií</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">Žiadne kategórie.</p>
          )}
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 border border-border rounded-lg p-2"
            >
              {editing?.id === c.id ? (
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              ) : (
                <div className="flex-1">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.slug}</div>
                </div>
              )}
              {editing?.id === c.id ? (
                <>
                  <Button
                    size="sm"
                    onClick={() =>
                      saveMut.mutate({ id: c.id, name: editing.name })
                    }
                  >
                    Uložiť
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    Zrušiť
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Zmazať kategóriu "${c.name}"?`))
                        delMut.mutate(c.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Input
            placeholder="Názov novej kategórie"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            onClick={() => name.trim() && saveMut.mutate({ name: name.trim() })}
            disabled={!name.trim() || saveMut.isPending}
          >
            <Plus className="h-4 w-4 mr-2" /> Pridať
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
