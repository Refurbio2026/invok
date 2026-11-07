import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthShell } from "@/components/invok/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studentLogin } from "@/lib/public/student.functions";
import { setStudentSession } from "@/lib/public/student-session";
import { toast } from "sonner";

export const Route = createFileRoute("/ziak/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie žiaka – INVOK" }] }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const navigate = useNavigate();
  const login = useServerFn(studentLogin);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ data: { code: code.trim(), pin: pin.trim() } });
      setStudentSession({ code: code.trim(), pin: pin.trim(), student: res.student });
      toast.success("Prihlásenie úspešné");
      navigate({ to: "/ziak/dashboard" });
    } catch (err: any) {
      toast.error(err?.message ?? "Prihlásenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Prihlásenie žiaka"
      subtitle="Zadaj svoj anonymný kód a PIN, ktoré si dostal od učiteľa."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="code">Anonymný kód</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required autoFocus />
        </div>
        <div>
          <Label htmlFor="pin">PIN</Label>
          <Input id="pin" type="password" autoComplete="current-password" value={pin} onChange={(e) => setPin(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Prihlasujem…" : "Prihlásiť sa"}
        </Button>
        <div className="text-center">
          <Link to="/prihlasenie" className="text-primary hover:underline text-sm">
            ← Späť na výber prihlásenia
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
