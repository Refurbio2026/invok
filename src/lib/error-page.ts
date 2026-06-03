function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatError(error: unknown): { name: string; message: string; stack: string; extra?: string } {
  if (error instanceof Error) {
    const extras: Record<string, unknown> = {};
    for (const key of Object.keys(error)) {
      if (key === "stack" || key === "message" || key === "name") continue;
      try {
        extras[key] = (error as unknown as Record<string, unknown>)[key];
      } catch {
        /* ignore */
      }
    }
    if (error.cause) extras.cause = String((error as { cause?: unknown }).cause);
    return {
      name: error.name || "Error",
      message: error.message || String(error),
      stack: error.stack || "",
      extra: Object.keys(extras).length ? JSON.stringify(extras, null, 2) : undefined,
    };
  }
  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : JSON.stringify(error, null, 2),
    stack: "",
  };
}

export function renderErrorPage(error?: unknown): string {
  // Show full details in non-production so authors can see the real stack trace.
  const isDev =
    typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production";

  let detailsHtml = "";
  if (isDev && error !== undefined) {
    const f = formatError(error);
    detailsHtml = `
      <details open class="details">
        <summary>SSR error details (dev only)</summary>
        <div class="err">
          <div class="err-title">${escapeHtml(f.name)}: ${escapeHtml(f.message)}</div>
          ${f.stack ? `<pre class="stack">${escapeHtml(f.stack)}</pre>` : ""}
          ${f.extra ? `<pre class="stack">${escapeHtml(f.extra)}</pre>` : ""}
        </div>
      </details>`;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 56rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
      .details { text-align: left; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; }
      .details summary { cursor: pointer; font-weight: 600; color: #b91c1c; }
      .err-title { margin-top: 0.75rem; font-weight: 600; color: #b91c1c; }
      .stack { margin-top: 0.5rem; padding: 0.75rem; background: #0b1020; color: #e2e8f0; border-radius: 0.375rem; overflow: auto; max-height: 22rem; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
      ${detailsHtml}
    </div>
  </body>
</html>`;
}
