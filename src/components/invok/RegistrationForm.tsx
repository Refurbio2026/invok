import { useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const schema = z.object({
  schoolName: z.string().trim().min(2, "Zadajte názov školy").max(200),
  schoolType: z.string().min(1, "Vyberte typ školy"),
  ico: z.string().trim().max(20).optional().or(z.literal("")),
  dic: z.string().trim().max(20).optional().or(z.literal("")),
  web: z.string().trim().max(200).optional().or(z.literal("")),
  street: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Zadajte mesto").max(100),
  zip: z.string().trim().max(10).optional().or(z.literal("")),
  region: z.string().trim().max(100).optional().or(z.literal("")),
  contactName: z.string().trim().min(2, "Zadajte meno kontaktnej osoby").max(120),
  contactRole: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Neplatný email").max(200),
  phone: z.string().trim().min(6, "Zadajte telefón").max(40),
  studentsCount: z.string().trim().max(20).optional().or(z.literal("")),
  classesCount: z.string().trim().max(20).optional().or(z.literal("")),
  interestedTesting: z.boolean().optional(),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  gdpr: z.literal(true, { errorMap: () => ({ message: "Musíte súhlasiť so spracovaním údajov" }) }),
  contactConsent: z.boolean().optional(),
});

type FormData = {
  schoolName: string;
  schoolType: string;
  ico: string;
  dic: string;
  web: string;
  street: string;
  city: string;
  zip: string;
  region: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  studentsCount: string;
  classesCount: string;
  interestedTesting: boolean;
  note: string;
  gdpr: boolean;
  contactConsent: boolean;
};

const initial: FormData = {
  schoolName: "",
  schoolType: "",
  ico: "",
  dic: "",
  web: "",
  street: "",
  city: "",
  zip: "",
  region: "",
  contactName: "",
  contactRole: "",
  email: "",
  phone: "",
  studentsCount: "",
  classesCount: "",
  interestedTesting: true,
  note: "",
  gdpr: false,
  contactConsent: false,
};

export function RegistrationForm() {
  const [data, setData] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-soft"
    >
      <div className="grid gap-5">
        <div>
          <Label htmlFor="schoolName">Názov školy</Label>
          <Input
            id="schoolName"
            value={data.schoolName}
            onChange={(e) => update("schoolName", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="schoolType">Typ školy</Label>
            <select
              id="schoolType"
              value={data.schoolType}
              onChange={(e) => update("schoolType", e.target.value)}
              className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">— vyberte —</option>
              <option value="ZŠ">Základná škola</option>
              <option value="SŠ">Stredná škola</option>
              <option value="Gymnázium">Gymnázium</option>
              <option value="SOŠ">Stredná odborná škola</option>
              <option value="Iné">Iné</option>
            </select>
          </div>
          <div>
            <Label htmlFor="ico">IČO</Label>
            <Input id="ico" value={data.ico} onChange={(e) => update("ico", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="dic">DIČ</Label>
            <Input id="dic" value={data.dic} onChange={(e) => update("dic", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="web">Web školy</Label>
            <Input id="web" value={data.web} onChange={(e) => update("web", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label htmlFor="street">Ulica a číslo</Label>
          <Input id="street" value={data.street} onChange={(e) => update("street", e.target.value)} className="mt-1.5" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="city">Mesto</Label>
            <Input id="city" value={data.city} onChange={(e) => update("city", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="zip">PSČ</Label>
            <Input id="zip" value={data.zip} onChange={(e) => update("zip", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="region">Kraj</Label>
            <Input id="region" value={data.region} onChange={(e) => update("region", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contactName">Meno kontaktnej osoby</Label>
            <Input id="contactName" value={data.contactName} onChange={(e) => update("contactName", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="contactRole">Pozícia kontaktnej osoby</Label>
            <Input id="contactRole" value={data.contactRole} onChange={(e) => update("contactRole", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="phone">Telefón</Label>
            <Input id="phone" value={data.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="studentsCount">Počet žiakov</Label>
            <Input id="studentsCount" value={data.studentsCount} onChange={(e) => update("studentsCount", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="classesCount">Počet tried</Label>
            <Input id="classesCount" value={data.classesCount} onChange={(e) => update("classesCount", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Checkbox
            id="interestedTesting"
            checked={data.interestedTesting}
            onCheckedChange={(v) => update("interestedTesting", v === true)}
          />
          <Label htmlFor="interestedTesting" className="font-normal cursor-pointer">
            Máme záujem o testovanie kompetencií
          </Label>
        </div>

        <div>
          <Label htmlFor="note">Poznámka</Label>
          <Textarea
            id="note"
            rows={5}
            value={data.note}
            onChange={(e) => update("note", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="gdpr"
              checked={data.gdpr}
              onCheckedChange={(v) => update("gdpr", v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="gdpr" className="font-normal cursor-pointer">
              Súhlasím so spracovaním osobných údajov v zmysle GDPR. *
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="contactConsent"
              checked={data.contactConsent}
              onCheckedChange={(v) => update("contactConsent", v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="contactConsent" className="font-normal cursor-pointer">
              Súhlasím s kontaktovaním zo strany tímu INVOK.
            </Label>
          </div>
        </div>

        <div>
          <Button type="submit" size="lg" className="rounded-full">
            Odoslať registráciu
          </Button>
        </div>
      </div>
    </form>
  );
}
