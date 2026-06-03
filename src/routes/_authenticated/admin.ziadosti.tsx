import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  approveSchoolRequest,
  listSchoolRequests,
  rejectSchoolRequest,
} from "@/lib/admin/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/ziadosti")({
  component: ZiadostiPage,
});

function ZiadostiPage() {
  const list = useServerFn(listSchoolRequests);
  const approve = useServerFn(approveSchoolRequest);
  const reject = useServerFn(rejectSchoolRequest);
  const qc = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({
    queryKey: ["school-requests"],
    queryFn: () => list(),
  });

  const approveM = useMutation({
    mutationFn: (id: string) => approve({ data: { requestId: id, createAccount: true } }),
    onSuccess: (res) => {
      toast.success(
        res.invitedEmail
          ? `Schválené. Pozvánka odoslaná na ${res.invitedEmail}.`
          : "Schválené.",
      );
      qc.invalidateQueries({ queryKey: ["school-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectM = useMutation({
    mutationFn: (id: string) => reject({ data: { requestId: id } }),
    onSuccess: () => {
      toast.success("Zamietnuté.");
      qc.invalidateQueries({ queryKey: ["school-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminLayout title="Žiadosti škôl" userEmail={email}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : !q.data || q.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Žiadne žiadosti.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Škola</th>
                  <th className="text-left px-4 py-3">Mesto / kraj</th>
                  <th className="text-left px-4 py-3">Kontakt</th>
                  <th className="text-left px-4 py-3">Stav</th>
                  <th className="text-left px-4 py-3">Vytvorené</th>
                  <th className="text-right px-4 py-3">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[r.city, r.region].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{r.contact_name}</div>
                      <div className="text-xs">{r.contact_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(r.created_at).toLocaleString("sk-SK")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={
                            r.status === "schvalena" || approveM.isPending
                          }
                          onClick={() => approveM.mutate(r.id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Schváliť
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            r.status === "zamietnuta" || rejectM.isPending
                          }
                          onClick={() => {
                            if (confirm("Zamietnuť túto žiadosť?")) {
                              rejectM.mutate(r.id);
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Zamietnuť
                        </Button>
                      </div>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    nova: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    v_rieseni: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    schvalena: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    zamietnuta: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    archivovana: "bg-muted text-muted-foreground",
  };
  const labels: Record<string, string> = {
    nova: "Nová",
    v_rieseni: "V riešení",
    schvalena: "Schválená",
    zamietnuta: "Zamietnutá",
    archivovana: "Archivovaná",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
