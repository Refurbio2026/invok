import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginStub } from "@/lib/auth-stub";

export const Route = createFileRoute("/skola/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie školy – INVOK" }] }),
  component: SkolaLogin,
});

function SkolaLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await loginStub({
        role: "skola",
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      navigate({ to: "/skola/dashboard" });
    } catch {
      toast.error("Prihlásenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell title="Prihlásenie školy" subtitle="Prístup pre koordinátora školy.">
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
        <p className="text-xs text-muted-foreground text-center pt-2">
          Ešte nie ste v programe?{" "}
          <Link to="/registracia-skoly" className="text-primary hover:underline">
            Registrovať školu
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
