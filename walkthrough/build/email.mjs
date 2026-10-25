// The email to leadership, in two forms:
//   email.html  a preview page with a "Copy for Gmail" button; the email
//               inside it uses tables and inline styles only, because
//               Gmail drops <style> blocks and web fonts.
//   email.txt   the same message as plain text, subject on the first line.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { WALKTHROUGH_DIR, blocks, escapeHtml, inline, plain } from "./content.mjs";

export const EMAIL_HTML_FILE = join(WALKTHROUGH_DIR, "email.html");
export const EMAIL_TEXT_FILE = join(WALKTHROUGH_DIR, "email.txt");

export function buildEmail({ meta, email }, { tokens }) {
  writeFileSync(EMAIL_HTML_FILE, renderHtml(meta, email, tokens));
  writeFileSync(EMAIL_TEXT_FILE, renderText(email));
}

/** {{pdf}} / {{video}} → a link when one is set, else "the attached …". */
function fillLinks(body, email) {
  const swap = (text, key, linked, attached) => {
    const url = email[`${key}_link`];
    return text.replaceAll(`{{${key}}}`, url ? `[${linked}](${url})` : attached);
  };
  return swap(swap(body, "pdf", "a PDF walkthrough", "the attached PDF"), "video", "a short video", "the attached video");
}

function renderText(email) {
  const body = blocks(fillLinks(email.body, email))
    .map((b) => (b.type === "list" ? b.items.map((i) => `• ${plain(i)}`).join("\n") : b.lines.map(plain).join("\n")))
    .join("\n\n");
  return `Subject: ${email.subject}\n\n${body}\n`;
}

function renderHtml(meta, email, t) {
  // Gmail ignores web fonts, so the heading falls through to the next
  // face in the theme's stack (Georgia), which is what readers will see.
  // Single quotes, since these go inside style="…" attributes.
  const bodyFont = t["font-body"].replace(/"/g, "'");
  const headFont = t["font-heading"].replace(/"/g, "'");
  const text = `font-family:${bodyFont};font-size:15px;line-height:1.55;color:${t.ink};`;
  const link = `color:${t.brick};font-weight:600;`;
  const strong = `color:${t.ink};`;

  const body = blocks(fillLinks(email.body, email))
    .map((b) => {
      if (b.type === "list") {
        return `<ul style="${text}margin:0 0 16px;padding-left:22px;">${b.items
          .map((i) => `<li style="margin:0 0 6px;">${inline(i, { linkStyle: link, strongStyle: strong })}</li>`)
          .join("")}</ul>`;
      }
      return `<p style="${text}margin:0 0 16px;">${b.lines
        .map((l) => inline(l, { linkStyle: link, strongStyle: strong }))
        .join("<br>")}</p>`;
    })
    .join("\n");

  const buttons = [
    email.video_link && ["Watch the video", email.video_link],
    email.pdf_link && ["Open the PDF", email.pdf_link],
  ].filter(Boolean);
  const buttonRow = buttons.length
    ? `<tr><td style="padding:4px 32px 20px;">${buttons
        .map(
          ([label, url]) =>
            `<a href="${escapeHtml(url)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 20px;background:${t.brick};color:#ffffff;font-family:${bodyFont};font-size:14px;font-weight:700;text-decoration:none;border-radius:3px;">${escapeHtml(label)}</a>`,
        )
        .join("")}</td></tr>`
    : "";

  const message = `
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(email.preview_text || "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${t.paper};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${t["paper-light"]};">
      <tr><td style="background:${t.ink};padding:28px 32px 26px;">
        <div style="font-family:${bodyFont};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${t.gold};">★ ${escapeHtml(meta.eyebrow)} ★</div>
        <div style="font-family:${headFont};font-size:30px;line-height:1.15;color:${t.paper};margin-top:10px;">${inline(meta.title)}</div>
      </td></tr>
      <tr><td style="padding:28px 32px 8px;">
${body}
      </td></tr>
      ${buttonRow}
      <tr><td style="border-top:1px solid ${t.paper};padding:14px 32px 18px;font-family:${bodyFont};font-size:12px;color:${t.muted};">${escapeHtml(meta.footer)} · ${escapeHtml(meta.date)}</td></tr>
    </table>
  </td></tr>
</table>`;

  return `<!doctype html>
<!-- Generated from content.md and theme.css by "npm run walkthrough:docs". Edit those, not this file. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email: ${escapeHtml(email.subject)}</title>
  <style>
    body { margin: 0; background: #e9e5dc; font-family: ${bodyFont}; }
    .bar { position: sticky; top: 0; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
           padding: 12px 16px; background: #fff; border-bottom: 1px solid #ddd; font-size: 14px; }
    .bar button { padding: 8px 14px; font: inherit; font-weight: 700; color: #fff; background: ${t.ink};
                  border: 0; border-radius: 3px; cursor: pointer; }
    .bar .subject { flex: 1 1 280px; }
    .bar .done { color: ${t.brick}; font-weight: 600; }
  </style>
</head>
<body>
  <div class="bar">
    <span class="subject"><strong>Subject:</strong> <span id="subject">${escapeHtml(email.subject)}</span></span>
    <button type="button" data-copy="subject">Copy subject</button>
    <button type="button" data-copy="message">Copy email for Gmail</button>
    <span class="done" id="done" aria-live="polite"></span>
  </div>
  <div id="message">${message}
  </div>
  <script>
    // Selecting the message and copying keeps its formatting, so it
    // pastes into a Gmail compose window looking the same as here.
    document.querySelectorAll("[data-copy]").forEach(function (button) {
      button.addEventListener("click", function () {
        var range = document.createRange();
        range.selectNodeContents(document.getElementById(button.dataset.copy));
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        selection.removeAllRanges();
        document.getElementById("done").textContent = ok
          ? "Copied. Paste into Gmail."
          : "Couldn't copy here. Select the email and press Ctrl/Cmd+C.";
      });
    });
  </script>
</body>
</html>
`;
}
