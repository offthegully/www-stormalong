// Lays out content.md as an HTML document styled by theme.css, saves it
// next to the PDF (open it in a browser to preview), then prints it.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { WALKTHROUGH_DIR, escapeHtml, inline } from "./content.mjs";
import { chromium } from "./playwright.mjs";

export const PDF_FILE = join(WALKTHROUGH_DIR, "stormalong-walkthrough.pdf");
export const PDF_HTML_FILE = join(WALKTHROUGH_DIR, "stormalong-walkthrough.html");

export async function buildPdf(content) {
  writeFileSync(PDF_HTML_FILE, renderHtml(content));

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(PDF_HTML_FILE).toString(), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: PDF_FILE, preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
  }
}

function renderHtml({ meta, highlights, pages }) {
  const total = pages.length + 1;
  const foot = (n) => `
    <footer class="sheet-foot">
      <span>${escapeHtml(meta.footer)}</span>
      <span>${n} / ${total}</span>
    </footer>`;

  const cover = `
  <section class="sheet cover">
    <div class="eyebrow">★ ${escapeHtml(meta.eyebrow)} ★</div>
    <h1>${inline(meta.title)}</h1>
    <p class="intro">${inline(meta.intro)} <span>(${escapeHtml(meta.date)})</span></p>

    <div class="glance-head">
      <h2>${escapeHtml(meta.glance_heading)}</h2>
      <span>${escapeHtml(meta.glance_note)}</span>
    </div>
    <div class="glance">
      ${pages
        .filter((p) => !p.section)
        .map(
          (p) => `
      <figure>
        <img src="screenshots/desktop-${p.file}-fold.jpg" alt="">
        <figcaption>${escapeHtml(p.title)}<code>${escapeHtml(p.shows)}</code></figcaption>
      </figure>`,
        )
        .join("")}
    </div>

    <ul class="highlights">
      ${highlights.map((h) => `<li>${inline(h)}</li>`).join("\n      ")}
    </ul>
    ${foot(1)}
  </section>`;

  const sheets = pages.map(
    (p) => `
  <section class="sheet">
    <header class="page-head">
      <h2>${p.number}. ${escapeHtml(p.title)}</h2>
      <code>${escapeHtml(p.shows)}</code>
    </header>
    <div class="shots">
      <figure class="shot desktop">
        <div class="shot-label">${escapeHtml(meta.desktop_label)}</div>
        <div class="frame"><img src="screenshots/desktop-${p.file}-fold.jpg" alt=""></div>
      </figure>
      <figure class="shot mobile">
        <div class="shot-label">${escapeHtml(meta.mobile_label)}</div>
        <div class="frame"><img src="screenshots/mobile-${p.file}-fold.jpg" alt=""></div>
      </figure>
    </div>
    <ul class="points">
      ${p.bullets.map((b) => `<li>${inline(b)}</li>`).join("\n      ")}
    </ul>
    ${p.note ? `<div class="note">${inline(p.note)}</div>` : ""}
    ${foot(p.number + 1)}
  </section>`,
  );

  return `<!doctype html>
<!-- Generated from content.md and theme.css by "npm run walkthrough:docs". Edit those, not this file. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(meta.title)}</title>
  <link rel="stylesheet" href="theme.css">
</head>
<body>
${cover}
${sheets.join("\n")}
</body>
</html>
`;
}
