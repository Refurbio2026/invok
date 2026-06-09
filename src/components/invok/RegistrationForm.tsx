import { useState } from "react";
import { z } from "zod";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  schoolName: z.string().min(2, "Zadajte názov školy"),
  schoolType: z.string().min(2, "Zadajte typ školy"),
  city: z.string().min(2, "Zadajte mesto"),
  contactName: z.string().min(2, "Zadajte meno"),
  role: z.string().min(2, "Zadajte vašu funkciu"),
  email: z.string().email("Neplatný email"),
  phone: z.string().min(6, "Zadajte telefónne číslo"),
  studentsCount: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = ["Škola", "Kontakt", "Doplňujúce informácie"];

export function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<FormData>({
    schoolName: "",
    schoolType: "",
    city: "",
    contactName: "",
    role: "",
    email: "",
    phone: "",
    studentsCount: "",
    note: "",
  });

  const update = (k: keyof FormData, v: string) =>
    setData((d) => ({ ...d, [k]: v }));

  const validateStep = () => {
    try {
      if (step === 0) {
        z.object({
          schoolName: schema.shape.schoolName,
          schoolType: schema.shape.schoolType,
          city: schema.shape.city,
        }).parse(data);
      } else if (step === 1) {
        z.object({
          contactName: schema.shape.contactName,
          role: schema.shape.role,
          email: schema.shape.email,
          phone: schema.shape.phone,
        }).parse(data);
      }
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0]?.message ?? "Skontrolujte vyplnené údaje");
      }
      return false;
    }
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = () => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Skontrolujte údaje");
      return;
    }
    setSubmitted(true);
    toast.success("Vaša registrácia bola odoslaná.");
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 md:p-12 text-center shadow-soft">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Ďakujeme za registráciu</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Vaša žiadosť o partnerstvo bola odoslaná. Náš tím vás bude kontaktovať
          do niekoľkých pracovných dní.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-soft">
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className="ml-2 text-sm hidden sm:block">{label}</span>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-4">
          <div>
            <Label htmlFor="schoolName">Názov školy</Label>
            <Input
              id="schoolName"
              value={data.schoolName}
              onChange={(e) => update("schoolName", e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schoolType">Typ školy</Label>
              <Input
                id="schoolType"
                placeholder="ZŠ / SŠ / Gymnázium"
                value={data.schoolType}
                onChange={(e) => update("schoolType", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Mesto</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">Meno a priezvisko</Label>
              <Input
                id="contactName"
                value={data.contactName}
                onChange={(e) => update("contactName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Funkcia</Label>
              <Input
                id="role"
                placeholder="Riaditeľ/ka, koordinátor/ka…"
                value={data.role}
                onChange={(e) => update("role", e.target.value)}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefón</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <div>
            <Label htmlFor="studentsCount">Predpokladaný počet žiakov</Label>
            <Input
              id="studentsCount"
              value={data.studentsCount}
              onChange={(e) => update("studentsCount", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="note">Poznámka</Label>
            <Textarea
              id="note"
              rows={5}
              value={data.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Späť
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={next}>
            Pokračovať <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={submit}>
            Odoslať registráciu <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
