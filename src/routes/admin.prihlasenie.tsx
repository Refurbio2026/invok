import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginStub } from "@/lib/auth-stub";

export const Route = createFileRoute("/admin/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie administrátora – INVOK" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await loginStub({
        role: "admin",
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Prihlásenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="Prihlásenie administrátora"
      subtitle="Prístup pre tím INVOK."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
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
