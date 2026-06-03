import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { listSchools } from "@/lib/admin/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/skoly")({
  component: SkolyPage,
});

function SkolyPage() {
  const list = useServerFn(listSchools);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({ queryKey: ["schools"], queryFn: () => list() });

  return (
    <AdminLayout title="Školy" userEmail={email}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : !q.data || q.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Zatiaľ žiadne školy. Schváľte žiadosť v sekcii „Žiadosti škôl“.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Názov</th>
                  <th className="text-left px-4 py-3">Mesto / kraj</th>
                  <th className="text-left px-4 py-3">Kontakt</th>
                  <th className="text-left px-4 py-3">Stav</th>
                  <th className="text-left px-4 py-3">Vytvorené</th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[s.city, s.region].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{s.contact_name}</div>
                      <div className="text-xs">{s.contact_email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{s.status}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(s.created_at).toLocaleString("sk-SK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
