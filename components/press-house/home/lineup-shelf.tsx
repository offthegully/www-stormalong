import Image from "next/image";
import Link from "next/link";
import { getCider, shelf } from "@/lib/catalogue";
import type { HomePhoto } from "@/lib/home-photos";
import { ArrowRightIcon } from "../icons";
import { routes } from "../site-config";
import { Eyebrow } from "../ui";

/** The cans in the line-up shot, left to right. */
const LINEUP_SLUGS = [
  "light-of-the-sun",
  "mass-appeal",
  "legendary-dry",
  "red-skies-at-night",
  "farmstand-unfiltered",
];

/**
 * "Where to start", as a photograph. It replaced six cider tiles: the
 * shot already shows the core cans standing in a row, so the bar
 * beneath names them in the same order and each name goes to its page
 * — the photograph is the shelf and the names are its labels. ABV and
 * sweetness, which the tiles carried, are one click away on /ciders.
 * The names are buttons, the same shape as "All ciders" beside them
 * but with a hairline border, so they read as clickable without
 * outranking it.
 *
 * The photo runs edge to edge at its own shape until it would pass
 * 640px tall. The words sit on an ink bar beneath it rather than over
 * it, because type laid over the shot would cover the cans.
 */
export function LineupShelf({ photo }: { photo: HomePhoto }) {
  const ciders = LINEUP_SLUGS.flatMap((slug) => {
    const cider = getCider(slug);
    return cider ? [cider] : [];
  });

  return (
    <section className="bg-ink text-paper">
      <div
        className="relative max-h-[640px] w-full overflow-hidden"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          style={{ objectPosition: photo.focus }}
          className="object-cover"
        />
      </div>
      <div className="border-b-4 border-double border-gold">
        <div className="ph-gutter flex flex-wrap items-end justify-between gap-x-8 gap-y-5 py-6">
          <div>
            <Eyebrow className="mb-2 block">On shelves all year</Eyebrow>
            <h2 className="ph-slab mb-3 text-[1.9rem] leading-none sm:text-[2.3rem]">
              Where to start
            </h2>
            <ul className="flex flex-wrap gap-2.5">
              {ciders.map((cider) => (
                <li key={cider.slug}>
                  <Link
                    href={`/ciders/${cider.slug}`}
                    className="ph-press group ph-label inline-flex items-center gap-2 border border-gold/70 px-3.5 py-2.5 text-paper hover:border-gold hover:bg-gold hover:text-ink"
                  >
                    {cider.name}
                    <ArrowRightIcon
                      size={11}
                      className="ph-move-fast text-gold group-hover:translate-x-1 group-hover:text-ink"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={routes.ciders}
            className="ph-press group ph-label inline-flex shrink-0 items-center gap-2 border-2 border-gold px-5 py-3 text-gold hover:bg-gold hover:text-ink"
          >
            All {shelf.length} ciders
            <ArrowRightIcon
              size={12}
              className="ph-move-fast group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
