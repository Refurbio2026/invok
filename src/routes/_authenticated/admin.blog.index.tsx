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
  Eye,
  Tag,
  Search,
  ExternalLink,
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
  listBlogCategories,
  listBlogPostsAdmin,
  saveBlogCategory,
  deleteBlogCategory,
  deleteBlogPost,
  type BlogPost,
  type BlogCategory,
} from "@/lib/admin/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/")({
  component: BlogAdminPage,
});

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "Koncept", cls: "bg-muted text-foreground" },
  published: {
    label: "Publikovaný",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  archived: { label: "Archivovaný", cls: "bg-amber-100 text-amber-900" },
};

function BlogAdminPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBlogPostsAdmin);
  const catFn = useServerFn(listBlogCategories);
  const delFn = useServerFn(deleteBlogPost);

  const posts = useQuery({ queryKey: ["admin-blog"], queryFn: () => listFn() });
  const categories = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => catFn(),
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts.data || []).filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category_id !== categoryFilter)
        return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !(p.excerpt || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [posts.data, query, statusFilter, categoryFilter]);

  const removeMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Článok zmazaný.");
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (e: any) => toast.error(e?.message || "Chyba pri mazaní."),
  });

  return (
    <AdminLayout title="Blog">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Blog</h1>
            <p className="text-sm text-muted-foreground">
              Redakčný systém prepojený s verejnou stránkou{" "}
              <Link to="/novinky" className="underline">
                /novinky
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-2">
            <CategoriesDialog
              categories={categories.data || []}
              onChanged={() =>
                qc.invalidateQueries({ queryKey: ["blog-categories"] })
              }
            />
            <Button asChild>
              <Link to="/admin/blog/$id" params={{ id: "novy" }}>
                <Plus className="h-4 w-4 mr-2" /> Nový článok
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa názvu alebo perexu…"
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
              <SelectItem value="published">Publikovaný</SelectItem>
              <SelectItem value="archived">Archivovaný</SelectItem>
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
          {posts.isLoading ? (
            <div className="p-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              Žiadne články. Kliknite na „Nový článok“.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Názov</th>
                  <th className="px-4 py-3 font-medium">Kategória</th>
                  <th className="px-4 py-3 font-medium">Autor</th>
                  <th className="px-4 py-3 font-medium">Vytvorené</th>
                  <th className="px-4 py-3 font-medium">Publikované</th>
                  <th className="px-4 py-3 font-medium">Stav</th>
                  <th className="px-4 py-3 font-medium text-right">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: BlogPost) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      <div>{p.title}</div>
                      <div className="text-xs text-muted-foreground">/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      {p.category?.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.author}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmt(p.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.published_at ? fmt(p.published_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_LABEL[p.status]?.cls}>
                        {STATUS_LABEL[p.status]?.label || p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {p.status === "published" && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Otvoriť na webe"
                          >
                            <a
                              href={`/novinky/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="icon" title="Upraviť">
                          <Link
                            to="/admin/blog/$id"
                            params={{ id: p.id }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Zmazať"
                          onClick={() => {
                            if (confirm(`Zmazať článok "${p.title}"?`))
                              removeMut.mutate(p.id);
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

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CategoriesDialog({
  categories,
  onChanged,
}: {
  categories: BlogCategory[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const saveFn = useServerFn(saveBlogCategory);
  const delFn = useServerFn(deleteBlogCategory);

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
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Žiadne kategórie.
            </p>
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
