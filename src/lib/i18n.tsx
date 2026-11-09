import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { hu } from "./i18n/hu";

export type Lang = "sk" | "hu";
export const LANG_COOKIE = "invok_lang";

/** Reads the visitor's language from the cookie on both server (SSR) and client. */
export const readLang = createIsomorphicFn()
  .server((): Lang => (getCookie(LANG_COOKIE) === "hu" ? "hu" : "sk"))
  .client((): Lang => (/(?:^|;\s*)invok_lang=hu/.test(document.cookie) ? "hu" : "sk"));

export function setLangCookie(lang: Lang) {
  // In an embedded preview (iframe) a lax cookie is dropped, so use a partitioned cross-site cookie on https.
  const attrs = location.protocol === "https:" ? "; samesite=none; secure; partitioned" : "; samesite=lax";
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000${attrs}`;
}

/** Translate a Slovak source string. Falls back to Slovak when no Hungarian entry exists. */
export function translate(lang: Lang, sk: string): string {
  if (lang !== "hu") return sk;
  return hu[sk] ?? sk;
}

const LangContext = createContext<Lang>("sk");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  useEffect(() => {
    if (lang !== "hu") return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    const start = () =>
      void import("./i18n/dom-translator").then((m) => {
        // Wait until React has hydrated lazily loaded page parts before changing their text.
        setTimeout(() => {
          if (!cancelled) stop = m.startDomTranslator();
        }, 150);
      });
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT() {
  const lang = useLang();
  return useCallback((sk: string) => translate(lang, sk), [lang]);
}

/** Picks the Hungarian variant of a database field when available. */
export function pickLang<T extends string | null | undefined>(lang: Lang, sk: T, huValue: T | null | undefined): T {
  return lang === "hu" && huValue ? (huValue as T) : sk;
}

type Localizable = { title: string; excerpt: string | null; content: string; title_hu?: string | null; excerpt_hu?: string | null; content_hu?: string | null };

/** Returns an article with Hungarian title, perex and content when the visitor uses Hungarian and they exist. */
export function localizePost<T extends Localizable>(lang: Lang, p: T): T {
  if (lang !== "hu") return p;
  return { ...p, title: p.title_hu || p.title, excerpt: p.excerpt_hu || p.excerpt, content: p.content_hu || p.content };
}
