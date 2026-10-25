import Image from "next/image";
import Link from "next/link";
import type { HomePhoto } from "@/lib/home-photos";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "../icons";
import { SectionRule } from "../ui";

/**
 * The photo shoot, five at a time — which five is set in
 * `lib/home-photos.ts`. One lead at two-thirds width, two
 * stacked beside it, and a pair beneath. The same grammar as the
 * detail pages' photo spread, so the site has one way of showing
 * photographs. On a phone the lead goes full width and the rest pair
 * up beneath it.
 *
 * It sits on cream on purpose. Everything from the masthead down to
 * here — At a Glance, the line-up, the trophy case — is on ink, and a
 * fourth dark band in a row would make the top of the page one long
 * navy block.
 */
export function PhotoMosaic({ photos }: { photos: HomePhoto[] }) {
  const [lead, ...rest] = photos.slice(0, 5);
  if (!lead) return null;

  return (
    <section className="bg-paper">
      <div className="ph-gutter py-11">
        <h2 className="sr-only">Respect the apple</h2>
        <SectionRule eyebrow="Respect the Apple" />
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-12">
          <PhotoPane
            photo={lead}
            sizes="(min-width: 1440px) 900px, (min-width: 1024px) 64vw, 100vw"
            className="col-span-2 aspect-[4/3] lg:col-span-8 lg:row-span-2 lg:aspect-auto"
          />
          {rest.map((photo, i) => (
            <PhotoPane
              key={photo.src}
              photo={photo}
              sizes={
                i < 2
                  ? "(min-width: 1440px) 440px, (min-width: 1024px) 32vw, 50vw"
                  : "(min-width: 1440px) 660px, (min-width: 1024px) 48vw, 50vw"
              }
              className={cn(
                "aspect-[4/3]",
                i < 2
                  ? "lg:col-span-4 lg:aspect-[16/10]"
                  : "lg:col-span-6 lg:aspect-[2/1]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One linked photograph. The shot zooms a touch under the pointer and
 * the label turns brick; the label is always shown rather than
 * revealed, because on a phone there is no hover to reveal it.
 */
function PhotoPane({
  photo,
  sizes,
  className,
}: {
  photo: HomePhoto;
  sizes: string;
  className?: string;
}) {
  return (
    <Link
      href={photo.href}
      className={cn("group relative block overflow-hidden bg-ink", className)}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        style={{ objectPosition: photo.focus }}
        className="ph-move object-cover group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
      />
      <span className="ph-tint ph-label absolute bottom-0 left-0 inline-flex items-center gap-2 bg-ink/90 px-2.5 py-1.5 text-[0.48rem] text-paper group-hover:bg-brick group-focus-visible:bg-brick sm:px-3.5 sm:py-2.5 sm:text-[0.56rem]">
        {photo.label}
        <ArrowRightIcon size={11} className="text-gold" />
      </span>
    </Link>
  );
}
