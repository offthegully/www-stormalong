// Reads walkthrough/content.md and walkthrough/theme.css into plain
// objects the PDF, email and video builders share. No dependencies:
// the content file is a small, fixed shape, so a hand-rolled reader
// keeps it that way.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const WALKTHROUGH_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SCREENSHOT_DIR = join(WALKTHROUGH_DIR, "screenshots");

const KEY_LINE = /^([a-z][a-z0-9_]*):\s?(.*)$/;

export function loadContent() {
  const raw = readFileSync(join(WALKTHROUGH_DIR, "content.md"), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "");

  const front = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!front) throw new Error("content.md must start with a --- block");
  const meta = readKeys(front[1].split("\n")).keys;

  const sections = {};
  let current = null;
  for (const line of raw.slice(front[0].length).split("\n")) {
    const heading = line.match(/^# (.+)$/);
    if (heading) {
      current = heading[1].trim().toLowerCase();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }

  for (const name of ["highlights", "pages", "video", "email"]) {
    if (!sections[name]) throw new Error(`content.md is missing the "# ${titleCase(name)}" section`);
  }

  return {
    meta,
    highlights: readBullets(sections.highlights),
    pages: readPages(sections.pages),
    video: readKeys(sections.video).keys,
    email: readEmail(sections.email),
  };
}

function readPages(lines) {
  const pages = [];
  let block = null;
  for (const line of lines) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      block = { title: heading[1].trim(), lines: [] };
      pages.push(block);
    } else if (block) {
      block.lines.push(line);
    }
  }

  return pages.map(({ title, lines: body }, i) => {
    const { keys } = readKeys(body);
    if (!keys.path) throw new Error(`Page "${title}" in content.md needs a "path:" line`);
    const slug = keys.slug || slugify(title.replace(/\(.*?\)/g, ""));
    return {
      title,
      path: keys.path,
      shows: keys.shows || keys.path,
      slug,
      number: i + 1,
      file: `${String(i + 1).padStart(2, "0")}-${slug}`,
      video: keys.video || "",
      note: keys.note || "",
      section: keys.section || "",
      bullets: readBullets(body),
    };
  });
}

function readEmail(lines) {
  const { keys, rest } = readKeys(lines, { stopAtText: true });
  return { ...keys, body: rest.join("\n").trim() };
}

/** `key: value` lines. With stopAtText, stops at the first line of prose. */
function readKeys(lines, { stopAtText = false } = {}) {
  const keys = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = line.match(KEY_LINE);
    if (m) keys[m[1]] = m[2].trim();
    else if (stopAtText) break;
  }
  return { keys, rest: stopAtText ? lines.slice(i) : [] };
}

/** `- ` bullets; an indented or bare line straight after one continues it. */
function readBullets(lines) {
  const bullets = [];
  let open = false;
  for (const line of lines) {
    if (/^\s*- /.test(line)) {
      bullets.push(line.replace(/^\s*- /, "").trim());
      open = true;
    } else if (!line.trim() || KEY_LINE.test(line)) {
      open = false;
    } else if (open) {
      bullets[bullets.length - 1] += " " + line.trim();
    }
  }
  return bullets;
}

// ── Markdown, the small subset content.md uses ──────────────────────────

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** **bold**, *italic*, [text](url). `linkStyle` lets the email inline its colour. */
export function inline(s, { linkStyle = "", strongStyle = "" } = {}) {
  const attr = (style) => (style ? ` style="${style}"` : "");
  return escapeHtml(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, `<a href="$2"${attr(linkStyle)}>$1</a>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong${attr(strongStyle)}>$1</strong>`)
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

export function plain(s) {
  return String(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1 ($2)")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2");
}

/** Paragraphs and `- ` lists, as blocks the caller renders. */
export function blocks(markdown) {
  return markdown
    .split(/\n\s*\n/)
    .map((chunk) => chunk.split("\n").filter((l) => l.trim()))
    .filter((lines) => lines.length)
    .map((lines) =>
      lines.every((l) => /^\s*- /.test(l))
        ? { type: "list", items: lines.map((l) => l.replace(/^\s*- /, "").trim()) }
        : { type: "para", lines: lines.map((l) => l.trim()) },
    );
}

// ── Theme ───────────────────────────────────────────────────────────────

/** The :root tokens from theme.css, plus its font @import. */
export function loadTheme() {
  const css = readFileSync(join(WALKTHROUGH_DIR, "theme.css"), "utf8");
  const root = css.match(/:root\s*\{([\s\S]*?)\}/);
  const tokens = {};
  if (root) {
    for (const m of root[1].replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[m[1]] = m[2].trim();
    }
  }
  const fontImport = css.match(/@import\s+url\(["']?([^"')]+)["']?\)/)?.[1] ?? "";
  const rootCss = root ? `:root {${root[1]}}` : "";
  return { css, tokens, fontImport, rootCss };
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(s) {
  return s[0].toUpperCase() + s.slice(1);
}
