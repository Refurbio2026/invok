import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";

type Props = {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  backTo = "/prihlasenie",
  backLabel = "Späť na výber prihlásenia",
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Link>
          <div className="bg-card border border-border rounded-2xl shadow-soft p-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
            )}
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
