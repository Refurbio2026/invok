import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { submitSchoolRequest } from "@/lib/public/school-requests.functions";

export const Route = createFileRoute("/registracia-skoly")({
  head: () => ({
    meta: [
      { title: "Registrácia školy – INVOK" },
      {
        name: "description",
        content:
          "Registrácia školy do programu INVOK. Vyplňte formulár a tím vás bude kontaktovať.",
      },
    ],
  }),
  component: RegistraciaSkoly,
});

const schema = z.object({
  name: z.string().trim().min(2).max(200),
  type: z
    .enum(["zakladna", "stredna", "gymnazium", "sou", "spojena", "ina"])
    .optional(),
  ico: z.string().trim().max(20).optional(),
  dic: z.string().trim().max(20).optional(),
  street: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  zip: z.string().trim().max(20).optional(),
  region: z.string().trim().max(100).optional(),
  website: z.string().trim().max(200).optional(),
  contact_name: z.string().trim().min(2).max(120),
  contact_position: z.string().trim().max(120).optional(),
  contact_email: z.string().trim().email().max(255),
  contact_phone: z.string().trim().max(40).optional(),
  students_count: z.coerce.number().int().nonnegative().optional(),
  classes_count: z.coerce.number().int().nonnegative().optional(),
  interested_in_testing: z.boolean(),
  note: z.string().max(2000).optional(),
  gdpr_consent: z.literal(true, {
    errorMap: () => ({ message: "Súhlas so spracovaním osobných údajov je povinný." }),
  }),
  contact_consent: z.boolean(),
});

function RegistraciaSkoly() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = useServerFn(submitSchoolRequest);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse({
      ...raw,
      interested_in_testing: fd.get("interested_in_testing") === "on",
      gdpr_consent: fd.get("gdpr_consent") === "on",
      contact_consent: fd.get("contact_consent") === "on",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await submit({ data: parsed.data });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registráciu sa nepodarilo odoslať.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Registrácia školy do programu INVOK
          </h1>
          <p className="text-muted-foreground mt-3">
            Vyplňte základné informácie o škole a kontaktnej osobe. Tím INVOK
            vás bude kontaktovať s ďalšími krokmi.
          </p>
        </div>

        {submitted ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-soft">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <Check className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Ďakujeme, vaša žiadosť bola prijatá. Budeme vás kontaktovať.
            </h2>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field name="name" label="Názov školy" className="sm:col-span-2" />
            <div>
              <Label htmlFor="type">Typ školy</Label>
              <select
                id="type"
                name="type"
                className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— vyberte —</option>
                <option value="zakladna">Základná</option>
                <option value="stredna">Stredná</option>
                <option value="gymnazium">Gymnázium</option>
                <option value="sou">SOŠ</option>
                <option value="spojena">Spojená</option>
                <option value="ina">Iná</option>
              </select>
            </div>
            <Field name="ico" label="IČO" />
            <Field name="dic" label="DIČ" />
            <Field name="website" label="Web školy" />
            <Field name="street" label="Ulica a číslo" className="sm:col-span-2" />
            <Field name="city" label="Mesto" />
            <Field name="zip" label="PSČ" />
            <Field name="region" label="Kraj" />
            <Field name="contact_name" label="Meno kontaktnej osoby" />
            <Field name="contact_position" label="Pozícia kontaktnej osoby" />
            <Field name="contact_email" label="E-mail" type="email" />
            <Field name="contact_phone" label="Telefón" type="tel" />
            <Field name="students_count" label="Počet žiakov" type="number" />
            <Field name="classes_count" label="Počet tried" type="number" />
            <div className="sm:col-span-2 flex items-center gap-2">
              <Checkbox id="interested_in_testing" name="interested_in_testing" defaultChecked />
              <Label htmlFor="interested_in_testing" className="font-normal">
                Máme záujem o testovanie kompetencií
              </Label>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="note">Poznámka</Label>
              <Textarea id="note" name="note" rows={4} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2 flex items-start gap-2">
              <Checkbox id="gdpr_consent" name="gdpr_consent" required />
              <Label htmlFor="gdpr_consent" className="font-normal text-sm">
                Súhlasím so spracovaním osobných údajov v zmysle GDPR. *
              </Label>
            </div>
            <div className="sm:col-span-2 flex items-start gap-2">
              <Checkbox id="contact_consent" name="contact_consent" />
              <Label htmlFor="contact_consent" className="font-normal text-sm">
                Súhlasím s kontaktovaním zo strany tímu INVOK.
              </Label>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-primary text-primary-foreground px-6"
              >
                {loading ? "Odosielam…" : "Odoslať registráciu"}
              </Button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  className,
}: {
  name: string;
  label: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} className="mt-1.5" />
    </div>
  );
}
