import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { listUsers } from "@/lib/admin/users.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pouzivatelia")({
  component: PouzivateliaPage,
});

const roleColor: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  koordinator: "bg-blue-500/10 text-blue-600",
  editor: "bg-amber-500/10 text-amber-700",
  viewer: "bg-muted text-muted-foreground",
  skola: "bg-emerald-500/10 text-emerald-700",
  ucitel: "bg-violet-500/10 text-violet-700",
};

function PouzivateliaPage() {
  const list = useServerFn(listUsers);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  return (
    <AdminLayout title="Používatelia" userEmail={email}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : q.error ? (
          <div className="p-6 text-destructive">
            {q.error instanceof Error ? q.error.message : "Chyba načítania."}
          </div>
        ) : !q.data || q.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Žiadni používatelia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Meno / E-mail</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Škola</th>
                  <th className="text-left px-4 py-3">Posl. prihlásenie</th>
                  <th className="text-left px-4 py-3">Vytvorené</th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">žiadna</span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r}
                              className={`text-xs px-2 py-0.5 rounded-full ${roleColor[r] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.school_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString("sk-SK")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleString("sk-SK")}
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
