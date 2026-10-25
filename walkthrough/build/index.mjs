// Rebuilds the walkthrough from content.md and theme.css.
//
//   npm run walkthrough          screenshots, PDF, email and video
//   npm run walkthrough:docs     PDF and email only, from the existing
//                                screenshots (for copy or design edits)
//
// Options (after `--`, e.g. `npm run walkthrough -- --url=https://...`):
//   --only=screenshots,pdf,email,video   run just these steps
//   --url=<address>                      screenshot a running site (a
//                                        preview deploy, or `npm run dev`)
//                                        instead of building one locally

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, relative } from "node:path";
import { WALKTHROUGH_DIR, loadContent, loadTheme } from "./content.mjs";
import { EMAIL_HTML_FILE, EMAIL_TEXT_FILE, buildEmail } from "./email.mjs";
import { PDF_FILE, buildPdf } from "./pdf.mjs";
import { takeScreenshots } from "./screenshots.mjs";
import { VIDEO_FILE, buildVideo, hasFfmpeg } from "./video.mjs";

const ROOT = dirname(WALKTHROUGH_DIR);
const STEPS = ["screenshots", "pdf", "email", "video"];

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const steps = args.only ? args.only.split(",").map((s) => s.trim()) : STEPS;
for (const s of steps) {
  if (!STEPS.includes(s)) throw new Error(`Unknown step "${s}". Use: ${STEPS.join(", ")}`);
}

const content = loadContent();
const theme = loadTheme();
const show = (file) => relative(ROOT, file);

if (steps.includes("screenshots")) {
  const server = args.url ? null : await startLocalSite();
  const url = args.url ?? server.url;
  console.log(`Screenshots of ${url}`);
  try {
    await takeScreenshots(content, url);
  } finally {
    server?.stop();
  }
}

if (steps.includes("pdf")) {
  console.log("PDF");
  await buildPdf(content);
  console.log(`  → ${show(PDF_FILE)}`);
}

if (steps.includes("email")) {
  console.log("Email");
  buildEmail(content, theme);
  console.log(`  → ${show(EMAIL_HTML_FILE)} (open in a browser, then "Copy email for Gmail")`);
  console.log(`  → ${show(EMAIL_TEXT_FILE)}`);
}

if (steps.includes("video")) {
  if (!hasFfmpeg()) {
    console.warn("Video skipped: ffmpeg is not installed (macOS: brew install ffmpeg).");
  } else {
    console.log("Video");
    await buildVideo(content, theme);
    console.log(`  → ${show(VIDEO_FILE)}`);
  }
}

/** A production build of the site on a free port, so screenshots match what ships. */
async function startLocalSite() {
  if (!existsSync(join(ROOT, ".next", "BUILD_ID")) || args.rebuild) {
    console.log("Building the site (npm run build)…");
    const build = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
    if (build.status !== 0) process.exit(build.status ?? 1);
  } else {
    console.log("Using the existing build in .next (add --rebuild after a site change).");
  }

  const port = await freePort();
  const child = spawn("npx", ["next", "start", "-p", String(port)], { cwd: ROOT, stdio: "ignore" });
  const url = `http://localhost:${port}`;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => child.kill() };
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error("The site did not start on " + url);
}

function freePort() {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}
