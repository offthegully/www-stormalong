---
# ─────────────────────────────────────────────────────────────────────
#  ALL THE WORDS IN THE WALKTHROUGH LIVE IN THIS FILE.
#
#  Edit anything here, then run   npm run walkthrough:docs
#  to rebuild the PDF and email in a few seconds (no new screenshots).
#  Run   npm run walkthrough   to retake screenshots and the video too.
#
#  How this file works (see walkthrough/README.md for more):
#    • Lines like  key: value  set a single piece of text.
#    • Lines starting with  -  are bullet points.
#    • **bold**, *italic* and [link text](https://...) all work.
#    • Lines starting with  #  inside this top block are notes, ignored.
# ─────────────────────────────────────────────────────────────────────
eyebrow: Stormalong Cider · Website walkthrough
title: The new stormalong.com
intro: A quick look at the redesigned site, page by page, on desktop and mobile. Every screenshot is from the current build.
date: October 2026
footer: Stormalong Cider · website walkthrough
glance_heading: Site at a glance
glance_note: 8 main sections · a page per cider
desktop_label: Desktop
mobile_label: Mobile
---

# Highlights

- **New home page photography.** The photo shoot is now front and center: the core cans standing in a row lead into "Where to start", and a five-photo "Respect the apple" spread sits under the medals.
- **Navigation.** Our Story, Ciders, Releases and The Club in the header, with a "Find a can near you" button on every page.
- **Built for phones.** Every page adapts to mobile with a menu button. Each walkthrough page shows the mobile view on the right.
- **Fast.** Every page is prebuilt ahead of time, so pages load quickly and search engines can read them.
- **Every page ends with a next step.** Each closes with a "Know which one you want? Find it" prompt and an email sign-up in the footer.

# Pages

<!--
  One "##" block per page of the walkthrough, in order.
    path:    the address that gets screenshotted
    shows:   the address as printed in the PDF (optional; defaults to path)
    slug:    the screenshot file name (optional; made from the title)
    video:   the one-line caption shown in the video for this page
    note:    an optional call-out box under the bullets
    section: optional. A heading on the page (e.g. Where to start):
             the screenshot starts at that part of the page instead of
             the top. Good for showing off something below the fold.
             These close-ups are left out of the video, which already
             scrolls the whole page.
  Then the bullet points that appear in the PDF.
  Delete a block to drop a page; copy one to add a page.
-->

## Home
path: /
video: The home page leads with what's new, then the line-up, the medals and the photo shoot.
- **At a glance** leads with the newest release (Kingston Black), plus Farmstand Unfiltered, the new 19.2 oz tall cans and the Rare Apple Club.
- **New: "Where to start" is now a photo** of the five core cans in a row, with a button for each cider underneath.
- **Trophy case:** 26 medals across 8 ciders and 7 competitions, including three Best of Class.
- **New: "Respect the apple" photo spread** from the shoot, then the find-a-can band (all six New England states) and a Rare Apple Series teaser.

## Home: Where to start (new)
path: /
shows: / · below the fold
slug: home-where-to-start
section: Where to start
- **New.** The six cider tiles are replaced by a photo of the five core cans standing in a row.
- A button for each cider sits underneath, in the same order as the cans, and goes straight to that cider's page.
- "All 15 ciders" takes visitors to the full line-up; ABV and sweetness are one click away there.

## Home: Respect the apple (new)
path: /
shows: / · below the fold
slug: home-photo-spread
section: Respect the apple
- **New.** Five photos from the shoot, under the trophy case: one large lead photo with four beside and beneath it.
- On a phone the lead photo runs full width and the rest pair up beneath it.
- The five photos are easy to swap for others from the shoot (a one-line change in the site code).

## Our Ciders
path: /ciders
video: All 15 ciders on one page, with a dry-to-sweet chart.
- All 15 ciders in one place, grouped as Core line-up (8), Seasonal (3) and Rare Apple Series (4).
- Filter tabs at the top jump between groups.
- A "How dry is it?" chart ranks every cider from driest to sweetest.

## Cider detail (e.g. Legendary Dry)
path: /ciders/legendary-dry
shows: /ciders/[name]
slug: cider-detail
video: Every cider gets its own page: story, stats, medals and apples.
- Every cider gets its own page, prebuilt so it loads fast and shows up in search.
- Story, ABV, sweetness, apple count, availability and a dry-to-sweet scale.
- Photo gallery, that cider's medals, the full list of apple varieties, and previous/next navigation.

## Rare Apple Series
path: /releases
video: The small-batch heirloom-apple line, with a push to the club.
- The small-batch heirloom-apple line: Beachcomber Cidah', Boston Heirloom, Grand Banks, Kingston Black.
- "Why they are rare" explains the heirloom-apple story.
- Email sign-up and a push to join the club for first access.

## Rare Apple Club
path: /cider-club
video: The Rare Apple Club: two shipments a year and 15% off.
- Membership: 2 shipments a year, $45–$75 each, 15% off all orders.
- What's included (first access, exclusives, discount) and subscription terms.
- Joining is by email for now; an email-only "Not ready to commit?" option is also offered.

## Our Story
path: /our-story
video: Our Story: respect the apple, Sherborn's cider history, and Captain Stormalong.
- "We respect the apple": 100% fresh pressed, no concentrate, naturally gluten free.
- Founded in 2014 by Shannon Edgar, and Sherborn, MA's history as home of the world's largest refined cider mill (1880–1930).
- The legend of Captain Alfred Bulltop Stormalong, the name on the can.

## Find our cider
path: /locator
slug: locator
video: A dedicated store and bar finder, with help if there's no can nearby.
- Dedicated store and bar finder page, with help for anyone who can't find a can nearby.
- "Ask your local shop" and "Still stuck?" prompts route people to us by email.
note: The distributor's store-finder map isn't plugged in yet, so the finder frame is empty in these screenshots.

## Contact
path: /contact
video: A simple contact form with a 48-hour reply promise.
- Simple contact form (name, email, topic, message) with a 48-hour reply promise.
- info@stormalong.com is shown for everything else, with a shortcut to the store finder.

# Video

title: The new stormalong.com
subtitle: A two-minute tour, desktop and mobile
end_title: stormalong.com
end_subtitle: Full walkthrough with every page is in the attached PDF.

# Email

<!--
  The email to leadership. Gmail: open walkthrough/email.html in a
  browser, select all, copy, and paste into a new message.
  walkthrough/email.txt is the same message as plain text.

  {{pdf}} and {{video}} turn into links when pdf_link / video_link are
  set (e.g. a Google Drive share link), or the words "the attached PDF"
  / "the attached video" when they are left blank.
-->

subject: A first look at the new stormalong.com
pdf_link:
video_link:
preview_text: A short video and a page-by-page PDF of the redesigned site, desktop and mobile.

Hi all,

The redesigned stormalong.com is ready for a look. I've put together {{video}} (about two minutes, no sound needed) and {{pdf}} with every page on desktop and mobile.

**What's new since the last walkthrough**

- The home page now leads with our own photography: the core cans in a row introduce the line-up, and a "Respect the apple" photo spread sits under the medals.
- Each core cider in "Where to start" is now a clear button straight to its page.

**What's on the site**

- Every cider has its own page with its story, stats, medals and apple varieties.
- A "How dry is it?" chart ranks all 15 ciders from driest to sweetest.
- Every page points visitors to the store finder, and the Rare Apple Club has its own page.
- Built for phones first, and fast to load.

**Still to do:** the distributor's store-finder map needs to be plugged in before launch.

I'd love any feedback on copy, photos or layout by the end of next week.

Thanks,
[Your name]
