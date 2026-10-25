// The overview video: a title card, then each page scrolling top to
// bottom on desktop and phone side by side with its caption from
// content.md, then an end card. Frames are drawn in Chromium (so the
// captions use theme.css) and piped into ffmpeg. No audio.

import { spawn, spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { SCREENSHOT_DIR, WALKTHROUGH_DIR, escapeHtml, inline } from "./content.mjs";
import { chromium } from "./playwright.mjs";

export const VIDEO_FILE = join(WALKTHROUGH_DIR, "stormalong-walkthrough.mp4");
const STAGE_FILE = join(tmpdir(), "stormalong-walkthrough-stage.html");

// Timing, in seconds. The home page gets longer because it carries the
// most news. Change these to make the video longer or shorter.
const FPS = 30;
const TITLE_SECONDS = 4.5;
const END_SECONDS = 5;
const PAGE_SECONDS = 11;
const HOME_SECONDS = 17;
const HOLD = 1.4; // pause at the top and bottom of each scroll
const FADE = 0.45;

// Drawn at 1280×720 and rendered at 1.5× for a 1080p file.
const W = 1280;
const H = 720;
const SCALE = 1.5;

export function hasFfmpeg() {
  return spawnSync("ffmpeg", ["-version"]).status === 0;
}

export async function buildVideo(content, theme) {
  const scenes = [
    { kind: "title", seconds: TITLE_SECONDS },
    // Section close-ups are skipped: the full page scroll already shows them.
    ...content.pages.filter((page) => !page.section).map((page) => ({
      kind: "page",
      page,
      seconds: page.path === "/" ? HOME_SECONDS : PAGE_SECONDS,
    })),
    { kind: "end", seconds: END_SECONDS },
  ];

  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", "23",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      VIDEO_FILE,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const finished = new Promise((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    // Loaded from a file, not setContent, so it may show the local screenshots.
    writeFileSync(STAGE_FILE, stageHtml(content, theme));
    await page.goto(pathToFileURL(STAGE_FILE).toString(), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    for (const [i, scene] of scenes.entries()) {
      const label = scene.kind === "page" ? scene.page.title : scene.kind;
      process.stdout.write(`  scene ${i + 1}/${scenes.length}: ${label}\n`);
      await page.evaluate(
        ({ kind, file, desktop, mobile }) => window.showScene(kind, file, desktop, mobile),
        {
          kind: scene.kind,
          file: scene.page?.file ?? null,
          desktop: scene.page ? pathToFileURL(join(SCREENSHOT_DIR, `desktop-${scene.page.file}-full.jpg`)).toString() : null,
          mobile: scene.page ? pathToFileURL(join(SCREENSHOT_DIR, `mobile-${scene.page.file}-full.jpg`)).toString() : null,
        },
      );

      const frames = Math.round(scene.seconds * FPS);
      for (let f = 0; f < frames; f++) {
        const t = f / FPS;
        await page.evaluate(([t, d, hold, fade]) => window.renderAt(t, d, hold, fade), [t, scene.seconds, HOLD, FADE]);
        const jpeg = await page.screenshot({ type: "jpeg", quality: 90 });
        if (!ffmpeg.stdin.write(jpeg)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      }
    }
  } finally {
    await browser.close();
    rmSync(STAGE_FILE, { force: true });
    ffmpeg.stdin.end();
  }
  await finished;
}

function stageHtml({ meta, pages, video }, { rootCss, fontImport }) {
  const scenePages = pages.filter((p) => !p.section);
  const sceneData = Object.fromEntries(
    scenePages.map((p, i) => [p.file, { number: i + 1, title: p.title, shows: p.shows, caption: p.video }]),
  );

  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="${fontImport}">
<style>
${rootCss}
* { box-sizing: border-box; margin: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--ink); color: var(--paper); font-family: var(--font-body); }
.scene { position: absolute; inset: 0; display: none; }
.scene.on { display: block; }
.fade { position: absolute; inset: 0; background: var(--ink); pointer-events: none; }
.eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .32em; text-transform: uppercase; color: var(--gold); }
.slab { font-family: var(--font-heading); font-weight: 400; }

/* title and end cards */
.card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; gap: 18px;
        background: radial-gradient(ellipse at center, #13304d 0%, var(--ink) 70%); }
.card .slab { font-size: 64px; line-height: 1.05; }
.card .sub { font-size: 21px; color: rgba(240,230,210,.8); max-width: 820px; }
.card .rule { width: 120px; height: 2px; background: var(--gold); }

/* page scenes */
.top { position: absolute; left: 64px; right: 64px; top: 26px; display: flex; align-items: baseline; justify-content: space-between; }
.top .slab { font-size: 30px; }
.top .num { color: var(--gold); margin-right: 12px; }
.chip { font-size: 15px; color: var(--gold); border: 1px solid rgba(201,162,39,.6); padding: 4px 12px; border-radius: 99px; }
.desk { position: absolute; left: 64px; top: 86px; width: 864px; height: 540px; border-radius: 8px; overflow: hidden;
        background: #fff; border-top: 22px solid #d9d3c4; box-shadow: 0 10px 40px rgba(0,0,0,.45); }
.desk::before { content: ""; position: absolute; top: -15px; left: 12px; width: 44px; height: 8px;
        background: radial-gradient(circle at 4px 4px, #e0645a 4px, transparent 4.5px), radial-gradient(circle at 20px 4px, #e6b94a 4px, transparent 4.5px), radial-gradient(circle at 36px 4px, #6fbf63 4px, transparent 4.5px); }
.phone { position: absolute; right: 64px; top: 86px; width: 254px; height: 540px; border-radius: 30px; overflow: hidden;
        background: #fff; border: 8px solid #02080f; box-shadow: 0 10px 40px rgba(0,0,0,.45); }
.desk img, .phone img { position: absolute; left: 0; top: 0; width: 100%; will-change: transform; }
.label { position: absolute; top: 632px; font-size: 11px; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: rgba(240,230,210,.5); }
.caption { position: absolute; left: 64px; right: 64px; bottom: 26px; font-size: 22px; line-height: 1.3; }
.dots { position: absolute; right: 64px; bottom: 34px; display: flex; gap: 7px; }
.dots i { width: 8px; height: 8px; border-radius: 50%; background: rgba(240,230,210,.25); }
.dots i.on { background: var(--gold); }
</style></head>
<body>
  <section class="scene" id="title"><div class="card">
    <div class="eyebrow">★ ${escapeHtml(meta.eyebrow)} ★</div>
    <div class="slab">${inline(video.title)}</div>
    <div class="rule"></div>
    <div class="sub">${inline(video.subtitle)} · ${escapeHtml(meta.date)}</div>
  </div></section>

  <section class="scene" id="end"><div class="card">
    <div class="eyebrow">★ ${escapeHtml(meta.eyebrow)} ★</div>
    <div class="slab">${inline(video.end_title)}</div>
    <div class="rule"></div>
    <div class="sub">${inline(video.end_subtitle)}</div>
  </div></section>

  <section class="scene" id="page">
    <div class="top"><div class="slab"><span class="num" id="num"></span><span id="ptitle"></span></div><div class="chip" id="path"></div></div>
    <div class="desk"><img id="dimg" alt=""></div>
    <div class="phone"><img id="mimg" alt=""></div>
    <div class="label" style="left:64px">${escapeHtml(meta.desktop_label)}</div>
    <div class="label" style="right:64px">${escapeHtml(meta.mobile_label)}</div>
    <div class="caption" id="caption"></div>
    <div class="dots">${scenePages.map((p) => `<i data-file="${p.file}"></i>`).join("")}</div>
  </section>

  <div class="fade" id="fade"></div>

<script>
const pages = ${JSON.stringify(sceneData)};
let current = null;

window.showScene = async (kind, file, desktop, mobile) => {
  document.querySelectorAll(".scene").forEach((s) => s.classList.toggle("on", s.id === kind));
  current = kind;
  if (kind !== "page") return;
  const p = pages[file];
  document.getElementById("num").textContent = p.number + ".";
  document.getElementById("ptitle").textContent = p.title;
  document.getElementById("path").textContent = p.shows;
  document.getElementById("caption").textContent = p.caption;
  document.querySelectorAll(".dots i").forEach((d) => d.classList.toggle("on", d.dataset.file === file));
  const load = (id, src) => new Promise((resolve) => {
    const img = document.getElementById(id);
    img.onload = () => img.decode().then(resolve, resolve);
    img.onerror = resolve;
    img.style.transform = "translateY(0)";
    img.src = src;
  });
  await Promise.all([load("dimg", desktop), load("mimg", mobile)]);
};

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

window.renderAt = (t, duration, hold, fade) => {
  const fadeIn = Math.min(1, t / fade);
  const fadeOut = Math.min(1, (duration - t) / fade);
  document.getElementById("fade").style.opacity = String(1 - Math.min(fadeIn, fadeOut));
  if (current !== "page") return;
  const progress = ease(Math.max(0, Math.min(1, (t - hold) / (duration - 2 * hold))));
  for (const id of ["dimg", "mimg"]) {
    const img = document.getElementById(id);
    const travel = Math.max(0, img.offsetHeight - img.parentElement.clientHeight);
    img.style.transform = "translateY(" + (-progress * travel) + "px)";
  }
};
</script>
</body></html>`;
}
