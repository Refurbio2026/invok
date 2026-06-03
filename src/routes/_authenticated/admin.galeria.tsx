import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Save, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listGalleryImages,
  registerGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  type GalleryImage,
} from "@/lib/admin/gallery.functions";

export const Route = createFileRoute("/_authenticated/admin/galeria")({
  component: GalleryPage,
});

function GalleryPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGalleryImages);
  const registerFn = useServerFn(registerGalleryImage);
  const updateFn = useServerFn(updateGalleryImage);
  const deleteFn = useServerFn(deleteGalleryImage);

  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);

  const list = useQuery({
    queryKey: ["gallery", "list"],
    queryFn: () => listFn(),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Obrázok zmazaný.");
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: any) => toast.error(e?.message || "Chyba pri mazaní."),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("gallery")
          .upload(path, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });
        if (upErr) throw upErr;
        await registerFn({
          data: {
            storage_path: path,
            filename: file.name,
            size_bytes: file.size,
            content_type: file.type,
          },
        });
      }
      toast.success("Obrázky nahrané.");
      qc.invalidateQueries({ queryKey: ["gallery"] });
    } catch (e: any) {
      toast.error(e?.message || "Nahrávanie zlyhalo.");
    } finally {
      setUploading(false);
    }
  };

  const filtered = (list.data || []).filter((g) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      g.filename.toLowerCase().includes(q) ||
      (g.alt || "").toLowerCase().includes(q) ||
      (g.caption || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Fotogaléria">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">Fotogaléria</h2>
            <p className="text-sm text-muted-foreground">
              Centrálna knižnica obrázkov pre Blog a ďalšie sekcie.
            </p>
          </div>
          <label
            className={
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground cursor-pointer hover:opacity-90 " +
              (uploading ? "opacity-60 pointer-events-none" : "")
            }
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Nahrať obrázky
          </label>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hľadať podľa názvu, alt textu, titulku…"
            className="pl-9"
          />
        </div>

        {list.isLoading ? (
          <div className="flex items-center text-muted-foreground py-10 justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            Fotogaléria je prázdna. Nahrajte prvé obrázky.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="rounded-lg overflow-hidden border border-border bg-card group"
              >
                <button
                  type="button"
                  onClick={() => setEditing(g)}
                  className="block w-full aspect-square bg-muted"
                >
                  <img
                    src={g.url}
                    alt={g.alt || g.filename}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate" title={g.filename}>
                    {g.filename}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(g)}
                      className="text-xs text-primary hover:underline"
                    >
                      Upraviť
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Zmazať „${g.filename}“?`)) {
                          delMut.mutate(g.id);
                        }
                      }}
                      className="text-xs text-destructive hover:underline inline-flex items-center"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Zmazať
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <EditImageDialog
          image={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            if (!editing) return;
            await updateFn({ data: { id: editing.id, ...patch } });
            qc.invalidateQueries({ queryKey: ["gallery"] });
            toast.success("Uložené.");
            setEditing(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

function EditImageDialog({
  image,
  onClose,
  onSave,
}: {
  image: GalleryImage | null;
  onClose: () => void;
  onSave: (patch: { alt?: string; caption?: string; filename?: string }) => Promise<void>;
}) {
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [filename, setFilename] = useState("");

  useState(() => {
    /* noop */
  });

  // Sync when image changes
  if (image && filename === "" && alt === "" && caption === "") {
    setAlt(image.alt || "");
    setCaption(image.caption || "");
    setFilename(image.filename);
  }

  return (
    <Dialog
      open={!!image}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setAlt("");
          setCaption("");
          setFilename("");
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upraviť obrázok</DialogTitle>
        </DialogHeader>
        {image && (
          <div className="space-y-3">
            <img
              src={image.url}
              alt={image.alt || image.filename}
              className="w-full max-h-64 object-contain rounded-lg border border-border bg-muted"
            />
            <div>
              <Label>Názov súboru</Label>
              <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
            </div>
            <div>
              <Label>Alternatívny text</Label>
              <Input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Popis pre prístupnosť"
              />
            </div>
            <div>
              <Label>Titulok (caption)</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Voliteľný titulok pod obrázkom"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Zrušiť
              </Button>
              <Button
                onClick={() =>
                  onSave({ alt, caption, filename }).then(() => {
                    setAlt("");
                    setCaption("");
                    setFilename("");
                  })
                }
              >
                <Save className="h-4 w-4 mr-2" /> Uložiť
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
