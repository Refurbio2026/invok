import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({
    skola: "", riaditel: "", email: "",
    kontakt: "", telefon: "", funkcia: "",
    mesto: "", pocet: "", poznamka: "", gdpr: false,
  });

  const upd = (k: string, v: string | boolean) => setData((d) => ({ ...d, [k]: v }));

  const next = () => {
    if (step === 1 && (!data.skola || !data.riaditel || !data.email)) return;
    if (step === 2 && (!data.kontakt || !data.telefon)) return;
    setStep((s) => s + 1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.gdpr) return;
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-card border border-border p-8 sm:p-12 text-center shadow-card">
        <div className="mx-auto h-16 w-16 rounded-full bg-teal/15 grid place-items-center mb-5">
          <Check className="h-8 w-8 text-teal" />
        </div>
        <h3 className="text-2xl font-bold">Ďakujeme za registráciu!</h3>
        <p className="mt-3 text-muted-foreground">Koordinátor programu vás bude kontaktovať do 3 pracovných dní.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-card">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-3 flex-1">
            <div className={cn(
              "h-10 w-10 rounded-full grid place-items-center font-bold text-sm transition",
              step >= n ? "bg-gradient-badge text-white shadow-soft" : "bg-muted text-muted-foreground"
            )}>{n}</div>
            <div className="hidden sm:block text-xs font-medium text-muted-foreground">
              {n === 1 ? "Škola" : n === 2 ? "Kontakt" : "Doplnenie"}
            </div>
            {n < 3 && <div className={cn("flex-1 h-0.5 mx-2", step > n ? "bg-teal" : "bg-border")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-5 animate-fade-up">
          <Field label="Názov školy *"><Input value={data.skola} onChange={(e) => upd("skola", e.target.value)} required maxLength={150} /></Field>
          <Field label="Meno riaditeľa *"><Input value={data.riaditel} onChange={(e) => upd("riaditel", e.target.value)} required maxLength={100} /></Field>
          <Field label="E-mail *"><Input type="email" value={data.email} onChange={(e) => upd("email", e.target.value)} required maxLength={150} /></Field>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 animate-fade-up">
          <Field label="Meno a priezvisko kontaktnej osoby *"><Input value={data.kontakt} onChange={(e) => upd("kontakt", e.target.value)} required maxLength={100} /></Field>
          <Field label="Telefón *"><Input type="tel" value={data.telefon} onChange={(e) => upd("telefon", e.target.value)} required maxLength={30} /></Field>
          <Field label="Funkcia"><Input value={data.funkcia} onChange={(e) => upd("funkcia", e.target.value)} maxLength={80} /></Field>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-5 animate-fade-up">
          <Field label="Okres / Mesto"><Input value={data.mesto} onChange={(e) => upd("mesto", e.target.value)} maxLength={80} /></Field>
          <Field label="Počet žiakov 8. a 9. ročníka"><Input type="number" min={0} max={9999} value={data.pocet} onChange={(e) => upd("pocet", e.target.value)} /></Field>
          <Field label="Poznámka"><Textarea value={data.poznamka} onChange={(e) => upd("poznamka", e.target.value)} maxLength={500} rows={3} /></Field>
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <Checkbox checked={data.gdpr} onCheckedChange={(c) => upd("gdpr", !!c)} className="mt-0.5" />
            <span className="text-muted-foreground">Súhlasím so spracovaním osobných údajov v súlade s GDPR za účelom registrácie do programu INVOK.</span>
          </label>
        </div>
      )}

      <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-border">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>Späť</Button>
        ) : <span />}
        {step < 3 ? (
          <Button type="button" onClick={next} className="bg-gradient-badge text-white hover:opacity-90">Pokračovať</Button>
        ) : (
          <Button type="submit" disabled={!data.gdpr} className="bg-gradient-badge text-white hover:opacity-90">Odoslať registráciu</Button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
