import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { RegistrationForm } from "@/components/invok/RegistrationForm";

export const Route = createFileRoute("/registracia-skoly")({
  head: () => ({
    meta: [
      { title: "Registrácia partnerskej školy – INVOK" },
      {
        name: "description",
        content:
          "Zaregistrujte vašu školu do programu INVOK a získajte prístup k modulom, testovaniu a metodickej podpore.",
      },
      {
        property: "og:title",
        content: "Registrácia partnerskej školy – INVOK",
      },
      {
        property: "og:description",
        content:
          "Pripojte vašu školu k programu INVOK – vyplňte krátky registračný formulár.",
      },
    ],
  }),
  component: RegistraciaSkolyPage,
});

function RegistraciaSkolyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Registrácia partnerskej školy
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Vyplňte krátky formulár a náš tím vás bude kontaktovať s ďalšími
            krokmi k zapojeniu vašej školy do programu INVOK.
          </p>
        </div>
        <RegistrationForm />
      </main>
      <Footer />
    </div>
  );
}
