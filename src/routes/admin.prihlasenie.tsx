import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimAdminIfFirst, getMyRoles } from "@/lib/admin/admin.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/admin/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie administrátora – INVOK" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/admin/prihlasenie" });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const claim = useServerFn(claimAdminIfFirst);
  const roles = useServerFn(getMyRoles);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = z
      .object({
        email: z.string().email(),
        password: z.string().min(8, "Heslo musí mať aspoň 8 znakov."),
      })
      .safeParse({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin/prihlasenie` },
        });
        if (error) throw error;
        // Pokus o prihlásenie (ak je auto-confirm)
        const { error: signInErr } = await supabase.auth.signInWithPassword(parsed.data);
        if (signInErr) {
          toast.success(
            "Účet vytvorený. Potvrďte si e-mail kliknutím na odkaz v doručenej správe a potom sa prihláste.",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
      }
      // Overenie, že máme aktívnu session pred volaním chránených server fn
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Prihlásenie zlyhalo – chýba aktívna relácia.");
        return;
      }
      // Bootstrap admin role ak ešte žiadny nie je
      try {
        await claim();
      } catch {
        /* ignorovať */
      }
      const r = await roles();
      if (!r.roles.includes("admin")) {
        await supabase.auth.signOut();
        toast.error("Tento účet nemá rolu administrátora.");
        return;
      }
      navigate({ to: search.redirect ?? "/admin/dashboard" });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Prihlásenie zlyhalo.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={mode === "login" ? "Prihlásenie administrátora" : "Registrácia administrátora"}
      subtitle="Prístup pre tím INVOK."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Heslo</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Pracujem…" : mode === "login" ? "Prihlásiť sa" : "Vytvoriť účet"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/prihlasenie" className="text-muted-foreground hover:text-primary">
            Späť na výber
          </Link>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          >
            {mode === "login" ? "Vytvoriť účet" : "Mám účet, prihlásiť sa"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
