# Website walkthrough

A package for showing leadership the new site: a short video, a
page-by-page PDF, and a ready-to-send email. All of it is built from two
files you can edit:

| To change… | Edit | Then run |
| --- | --- | --- |
| Any wording: PDF, email, video captions | `content.md` | `npm run walkthrough:docs` |
| Colours, fonts, sizes, layout | `theme.css` | `npm run walkthrough:docs` |
| Which pages are shown, or their order | `content.md` (the `## ` blocks under `# Pages`) | `npm run walkthrough` |
| The screenshots, after the site changes | nothing | `npm run walkthrough -- --rebuild` |

`walkthrough:docs` takes a few seconds and remakes only the PDF and the
email from the screenshots already here. `walkthrough` remakes everything,
including new screenshots and the video (a few minutes).

## What's here

| File | What it is |
| --- | --- |
| `stormalong-walkthrough.mp4` | The video: about two minutes, 1080p, no sound. Each page scrolls top to bottom on desktop and phone side by side, with a caption. |
| `stormalong-walkthrough.pdf` | The PDF: a cover with every page at a glance, then one page per section with desktop and mobile screenshots and bullet points. |
| `stormalong-walkthrough.html` | The page the PDF is printed from. Open it in a browser to preview a change. |
| `email.html` | The email. Open it in a browser, click **Copy subject** and **Copy email for Gmail**, and paste into a new Gmail message. |
| `email.txt` | The same email as plain text. |
| `screenshots/` | Every page on desktop (1440 px wide) and phone (390 px), as `-fold` (first screen) and `-full` (whole page). |
| `content.md` | All the words. |
| `theme.css` | All the design. |
| `build/` | The scripts that put it together. You shouldn't need to touch these. |

## Editing the words (`content.md`)

The file explains itself at the top. In short:

- `key: value` lines set one piece of text, such as `title:` or `subject:`.
- Lines starting with `- ` are bullet points.
- `**bold**`, `*italic*` and `[link text](https://…)` work everywhere.
- Each `## ` block under `# Pages` is one page of the PDF and one scene of
  the video. Copy a block to add a page, delete it to remove one, move it to
  reorder.
- `section: Where to start` on a page block takes the screenshot from that
  heading down, for things below the first screen.

### Sending the email with links instead of attachments

Upload the PDF and video to Google Drive, then paste the share links into
`pdf_link:` and `video_link:` in the `# Email` section of `content.md` and
run `npm run walkthrough:docs`. The email then links to them and gets
**Watch the video** and **Open the PDF** buttons. Left blank, it refers to
"the attached PDF" and "the attached video". (Gmail caps attachments at
25 MB. The video is under that, but Drive links are friendlier on phones.)

## Changing the design (`theme.css`)

The colours and fonts at the top (`:root`) are shared by the PDF, the email
and the video, and match the site. The rest of the file lays out the PDF.
Gmail does not load web fonts, so the email heading shows in Georgia (the
next font in `--font-heading`).

Video timing (seconds per page, title card length) is at the top of
`build/video.mjs`.

## Setting up (first time on a new computer)

```sh
npm install
npx playwright install chromium   # the browser that takes the screenshots
brew install ffmpeg               # macOS; needed for the video only
```

`npm run walkthrough` builds the site and screenshots that production build,
so the walkthrough shows exactly what will ship. To screenshot something
else, such as a preview deployment or `npm run dev`, pass its address:

```sh
npm run walkthrough -- --url=https://preview.example.com
npm run walkthrough -- --only=screenshots,pdf   # just some steps
```
