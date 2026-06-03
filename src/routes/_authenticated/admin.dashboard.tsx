import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { getAdminStats, getMyRoles } from "@/lib/admin/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchRoles = useServerFn(getMyRoles);
  const fetchStats = useServerFn(getAdminStats);
  const [email, setEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!ignore) setEmail(data.user?.email ?? null);
      const roles = await fetchRoles();
      if (!ignore) setAuthorized(roles.roles.includes("admin"));
    })();
    return () => {
      ignore = true;
    };
  }, [fetchRoles]);

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
    enabled: authorized === true,
  });

  if (authorized === false) {
    return (
      <AdminLayout title="Dashboard" userEmail={email}>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold">Nemáte oprávnenie administrátora.</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Kontaktujte tím INVOK.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" userEmail={email}>
      {!stats.data ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Načítavam štatistiky…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Školy" value={stats.data.schools} icon={Building2} />
          <StatCard
            label="Aktívne školy"
            value={stats.data.activeSchools}
            icon={CheckCircle2}
          />
          <StatCard
            label="Nové žiadosti"
            value={stats.data.pendingRequests}
            icon={Inbox}
            accent
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-8">
        Ďalšie metriky (triedy, žiaci, testy, výsledky) sa doplnia v ďalších fázach
        spolu s vytvorením príslušných modulov.
      </p>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
  accent?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div
        className={
          accent
            ? "h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
            : "h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
        }
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
