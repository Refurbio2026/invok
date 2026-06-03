import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ucitel/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie učiteľa – INVOK" }] }),
  component: UcitelLogin,
});

function UcitelLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = z
      .object({ email: z.string().email(), password: z.string().min(8) })
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
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      navigate({ to: "/ucitel/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Prihlásenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Prihlásenie učiteľa" subtitle="Prístup pre učiteľov školy.">
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
          {loading ? "Prihlasujem…" : "Prihlásiť sa"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/prihlasenie" className="text-muted-foreground hover:text-primary">
            Späť na výber
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          Účty učiteľov spravuje koordinátor školy.
        </p>
      </form>
    </AuthShell>
  );
}
