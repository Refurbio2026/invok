import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { registerSchoolStub } from "@/lib/auth-stub";

export const Route = createFileRoute("/registracia-skoly")({
  head: () => ({
    meta: [
      { title: "Registrácia školy – INVOK" },
      {
        name: "description",
        content:
          "Registrácia školy do programu INVOK. Vyplňte formulár a tím vás bude kontaktovať.",
      },
      { property: "og:title", content: "Registrácia školy – INVOK" },
    ],
  }),
  component: RegistraciaSkoly,
});

const schema = z.object({
  nazov: z.string().trim().min(2).max(200),
  ico: z.string().trim().min(6).max(20),
  mesto: z.string().trim().min(2).max(100),
  kraj: z.string().trim().min(2).max(100),
  adresa: z.string().trim().min(3).max(200),
  meno: z.string().trim().min(2).max(120),
  funkcia: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  telefon: z.string().trim().min(6).max(40),
  pocet8: z.string().trim().min(1).max(6),
  pocet9: z.string().trim().min(1).max(6),
  sprava: z.string().max(2000).optional(),
});

function RegistraciaSkoly() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error("Skontrolujte vyplnené polia.");
      return;
    }
    setLoading(true);
    try {
      await registerSchoolStub(parsed.data);
      setSubmitted(true);
    } catch {
      toast.error("Registráciu sa nepodarilo odoslať.");
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
              Ďakujeme. Registráciu školy sme prijali a tím INVOK vás bude
              kontaktovať.
            </h2>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field name="nazov" label="Názov školy" className="sm:col-span-2" />
            <Field name="ico" label="IČO školy" />
            <Field name="mesto" label="Mesto" />
            <Field name="kraj" label="Kraj" />
            <Field name="adresa" label="Adresa školy" className="sm:col-span-2" />
            <Field name="meno" label="Meno kontaktnej osoby" />
            <Field name="funkcia" label="Funkcia kontaktnej osoby" />
            <Field name="email" label="E-mail" type="email" />
            <Field name="telefon" label="Telefón" type="tel" />
            <Field name="pocet8" label="Počet žiakov v 8. ročníku" type="number" />
            <Field name="pocet9" label="Počet žiakov v 9. ročníku" type="number" />
            <div className="sm:col-span-2">
              <Label htmlFor="sprava">Správa</Label>
              <Textarea id="sprava" name="sprava" rows={4} className="mt-1.5" />
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
      <Input id={name} name={name} type={type} required className="mt-1.5" />
    </div>
  );
}
