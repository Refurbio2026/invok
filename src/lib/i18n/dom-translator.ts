import { hu } from "./hu";

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);

function norm(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function translateText(node: Text) {
  const raw = node.nodeValue ?? "";
  const key = norm(raw);
  if (!key) return;
  const tr = hu[key];
  if (!tr || tr === key) return;
  const lead = raw.match(/^\s*/)?.[0] ?? "";
  const trail = raw.match(/\s*$/)?.[0] ?? "";
  node.nodeValue = lead + tr + trail;
}

function translateEl(el: Element) {
  if (SKIP.has(el.tagName) || el.closest("[data-no-translate],.ProseMirror")) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v) {
      const tr = hu[norm(v)];
      if (tr && tr !== v) el.setAttribute(a, tr);
    }
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const p = root.parentElement;
    if (p && !SKIP.has(p.tagName) && !p.closest("[data-no-translate],.ProseMirror")) translateText(root as Text);
    return;
  }
  if (!(root instanceof Element)) return;
  translateEl(root);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let n = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) {
      const p = n.parentElement;
      if (p && !SKIP.has(p.tagName) && !p.closest("[data-no-translate],.ProseMirror")) translateText(n as Text);
    } else translateEl(n as Element);
    n = tw.nextNode();
  }
}

/** Translates rendered Slovak UI text into Hungarian and keeps it translated as React updates the page. */
export function startDomTranslator(): () => void {
  walk(document.body);
  document.documentElement.classList.remove("i18n-pending");
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") walk(m.target);
      else if (m.type === "attributes") translateEl(m.target as Element);
      else m.addedNodes.forEach(walk);
    }
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  return () => obs.disconnect();
}
