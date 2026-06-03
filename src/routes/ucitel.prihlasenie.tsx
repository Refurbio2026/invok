import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginStub } from "@/lib/auth-stub";

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
    setLoading(true);
    try {
      await loginStub({
        role: "ucitel",
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      navigate({ to: "/ucitel/dashboard" });
    } catch {
      toast.error("Prihlásenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell title="Prihlásenie učiteľa" subtitle="Prístup pre učiteľov zapojených škôl.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail alebo používateľský kód</Label>
          <Input id="email" name="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Heslo</Label>
          <Input id="password" name="password" type="password" required className="mt-1.5" />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Prihlasujem…" : "Prihlásiť sa"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/prihlasenie" className="text-muted-foreground hover:text-primary">
            Späť na výber
          </Link>
          <a href="#" className="text-primary hover:underline">
            Zabudnuté heslo
          </a>
        </div>
      </form>
    </AuthShell>
  );
}
