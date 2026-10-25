// Takes a fold (first screen) and a full-page screenshot of every page
// in content.md, on desktop and on a phone.

import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { SCREENSHOT_DIR } from "./content.mjs";
import { chromium } from "./playwright.mjs";

export const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
};

export async function takeScreenshots(content, baseUrl) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  // Start clean so a page dropped from content.md leaves no stale shots.
  for (const f of readdirSync(SCREENSHOT_DIR)) {
    if (/^(desktop|mobile)-.*\.jpg$/.test(f)) rmSync(join(SCREENSHOT_DIR, f));
  }

  const browser = await chromium.launch();
  try {
    for (const [device, options] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext(options);
      const host = new URL(baseUrl).hostname;
      // Past the age gate, as a returning visitor would be.
      await context.addCookies([{ name: "stormalong_age_ok", value: "1", domain: host, path: "/" }]);
      const page = await context.newPage();

      for (const p of content.pages) {
        process.stdout.write(`  ${device.padEnd(7)} ${p.path}\n`);
        await page.goto(new URL(p.path, baseUrl).toString(), { waitUntil: "networkidle" });
        await settle(page);
        const name = `${device}-${p.file}`;
        if (p.section) await scrollToSection(page, p.section);
        await page.screenshot({ path: join(SCREENSHOT_DIR, `${name}-fold.jpg`), type: "jpeg", quality: 82 });
        // A section shot is a close-up of a page already shown whole.
        if (p.section) continue;
        await page.screenshot({
          path: join(SCREENSHOT_DIR, `${name}-full.jpg`),
          type: "jpeg",
          quality: 78,
          fullPage: true,
        });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

/** Bring the section whose heading reads `heading` to the top of the screen. */
async function scrollToSection(page, heading) {
  const found = await page.evaluate((heading) => {
    const want = heading.trim().toLowerCase();
    const h = [...document.querySelectorAll("h1, h2, h3")].find(
      (el) => el.textContent.trim().toLowerCase() === want,
    );
    if (!h) return false;
    const target = h.closest("section") ?? h;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    return true;
  }, heading);
  if (!found) throw new Error(`No heading "${heading}" on the page (from a "section:" line in content.md)`);
  await page.waitForTimeout(600);
}

/** Scroll to the bottom and back so lazy images load and reveal animations finish. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  // Lazy images hidden at this width never load, so cap the wait.
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        [...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))),
      ),
      new Promise((r) => setTimeout(r, 5000)),
    ]),
  );
  await page.waitForTimeout(800);
}
