import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [d, setD] = useState({ meno: "", email: "", sprava: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.meno || !d.email || !d.sprava) return;
    setDone(true);
  };

  if (done) return (
    <div className="rounded-3xl bg-card border border-border p-8 text-center shadow-card">
      <div className="mx-auto h-14 w-14 rounded-full bg-teal/15 grid place-items-center mb-4">
        <Check className="h-7 w-7 text-teal" />
      </div>
      <h3 className="text-xl font-bold">Správa odoslaná</h3>
      <p className="mt-2 text-muted-foreground">Ozveme sa vám čo najskôr.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card grid gap-5">
      <div className="grid gap-2">
        <Label>Meno a priezvisko *</Label>
        <Input value={d.meno} onChange={(e) => setD({ ...d, meno: e.target.value })} required maxLength={100} />
      </div>
      <div className="grid gap-2">
        <Label>E-mail *</Label>
        <Input type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} required maxLength={150} />
      </div>
      <div className="grid gap-2">
        <Label>Vaša správa *</Label>
        <Textarea rows={5} value={d.sprava} onChange={(e) => setD({ ...d, sprava: e.target.value })} required maxLength={1000} />
      </div>
      <Button type="submit" className="bg-gradient-badge text-white hover:opacity-90 justify-self-start">Odoslať správu</Button>
    </form>
  );
}
