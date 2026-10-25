import { FindACan } from "@/components/press-house/find-a-can";
import { FrontPage } from "@/components/press-house/home/front-page";
import { LineupShelf } from "@/components/press-house/home/lineup-shelf";
import { PhotoMosaic } from "@/components/press-house/home/photo-mosaic";
import { TrophyCase } from "@/components/press-house/home/trophy-case";
import { RareAppleBand } from "@/components/press-house/rare-apple-band";
import { lineupPhoto, spreadPhotos } from "@/lib/home-photos";

/**
 * Direction D, "Press House". The order is the argument: what is new,
 * what it makes, what the brand has won, what it looks like out in
 * the world, and then the only question a distribution-led business
 * actually needs to answer — where can I buy it.
 */
export default function Home() {
  return (
    <>
      {/* The page's h1. The design has no slot for a masthead line — the
          largest type on screen is the lead cider's name, which used to
          be the h1 and so made the home page's one top-level heading a
          seasonal product. That is wrong for a crawler and wrong for a
          screen reader arriving cold: neither learned what this site
          sells. The lead is now an h2 where it belongs, and this states
          the proposition once. It is the same claim the footer, the
          <title> and the meta description all make, so it is not
          saying anything to a crawler that a reader is not told. */}
      <h1 className="sr-only">
        Stormalong Cider — unfiltered craft hard cider from Massachusetts
      </h1>
      <FrontPage />
      <LineupShelf photo={lineupPhoto} />
      <TrophyCase />
      <PhotoMosaic photos={spreadPhotos} />
      <FindACan />
      <RareAppleBand />
    </>
  );
}
