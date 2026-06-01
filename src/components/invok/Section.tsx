import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  alt = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  alt?: boolean;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", alt && "bg-[var(--color-surface)]", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <div className="max-w-3xl mb-12 sm:mb-16">
            {eyebrow && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-teal mb-3 px-3 py-1 rounded-full bg-accent">
                {eyebrow}
              </span>
            )}
            {title && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
