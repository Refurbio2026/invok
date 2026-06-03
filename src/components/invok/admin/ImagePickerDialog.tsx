import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listGalleryImages,
  registerGalleryImage,
  type GalleryImage,
} from "@/lib/admin/gallery.functions";

export type PickedImage = {
  url: string;
  alt: string;
  caption: string;
  filename: string;
};

type Props = {
  trigger: React.ReactNode;
  onPick: (img: PickedImage) => void;
  title?: string;
};

export function ImagePickerDialog({ trigger, onPick, title }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const qc = useQueryClient();
  const listFn = useServerFn(listGalleryImages);
  const registerFn = useServerFn(registerGalleryImage);

  const list = useQuery({
    queryKey: ["gallery", "list"],
    queryFn: () => listFn(),
    enabled: open,
  });

  const [uploading, setUploading] = useState(false);
  const [altInput, setAltInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
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
      const row = await registerFn({
        data: {
          storage_path: path,
          filename: file.name,
          alt: altInput || null,
          caption: captionInput || null,
          size_bytes: file.size,
          content_type: file.type,
        },
      });
      toast.success("Obrázok nahraný do Fotogalérie.");
      qc.invalidateQueries({ queryKey: ["gallery"] });
      onPick({
        url: row.url,
        alt: row.alt || "",
        caption: row.caption || "",
        filename: row.filename,
      });
      setAltInput("");
      setCaptionInput("");
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || "Vybrať obrázok"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gallery">
          <TabsList>
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-1" /> Fotogaléria
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-1" /> Nahrať nový
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hľadať podľa názvu, popisu…"
                className="pl-9"
              />
            </div>
            {list.isLoading ? (
              <div className="flex items-center text-muted-foreground py-8 justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                Fotogaléria je zatiaľ prázdna. Použite kartu „Nahrať nový“.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => {
                      onPick({
                        url: g.url,
                        alt: g.alt || "",
                        caption: g.caption || "",
                        filename: g.filename,
                      });
                      setOpen(false);
                    }}
                    className="group text-left rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-card"
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={g.url}
                        alt={g.alt || g.filename}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">
                        {g.filename}
                      </p>
                      {g.alt && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {g.alt}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Alternatívny text (alt)</Label>
                <Input
                  value={altInput}
                  onChange={(e) => setAltInput(e.target.value)}
                  placeholder="Krátky popis obrázka pre prístupnosť"
                />
              </div>
              <div>
                <Label>Titulok (caption)</Label>
                <Input
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="Voliteľný titulok pod obrázkom"
                />
              </div>
            </div>
            <label
              className={
                "block rounded-lg border-2 border-dashed border-border p-10 text-center cursor-pointer hover:bg-muted/40 " +
                (uploading ? "opacity-60 pointer-events-none" : "")
              }
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {uploading ? (
                <div className="flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Nahrávam…
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Kliknite alebo presuňte súbor
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Obrázok sa automaticky pridá aj do Fotogalérie.
                  </p>
                </>
              )}
            </label>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
