import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginStub } from "@/lib/auth-stub";

export const Route = createFileRoute("/ziak/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie žiaka – INVOK" }] }),
  component: ZiakLogin,
});

function ZiakLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await loginStub({
        role: "ziak",
        schoolCode: String(fd.get("schoolCode") ?? ""),
        classCode: String(fd.get("classCode") ?? ""),
        studentCode: String(fd.get("studentCode") ?? ""),
        pin: String(fd.get("pin") ?? ""),
      });
      navigate({ to: "/ziak/dashboard" });
    } catch {
      toast.error("Prihlásenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="Prihlásenie žiaka"
      subtitle="Prihlás sa pomocou kódov, ktoré ti dal učiteľ."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="schoolCode">Kód školy</Label>
          <Input id="schoolCode" name="schoolCode" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="classCode">Kód triedy</Label>
          <Input id="classCode" name="classCode" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="studentCode">Anonymný kód žiaka</Label>
          <Input id="studentCode" name="studentCode" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="pin">Heslo alebo PIN</Label>
          <Input id="pin" name="pin" type="password" required className="mt-1.5" />
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
