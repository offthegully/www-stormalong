/**
 * The photographs on the home page.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ TO SWAP A PHOTO in the spread under the medals, change a name in │
 * │ `SPREAD` below to any other name from the `photos` list. The     │
 * │ type checker rejects a name that is not in the list, so a typo   │
 * │ fails the build instead of leaving a hole on the page.           │
 * │                                                                  │
 * │ TO ADD A NEW PHOTO, put the file in public/images/landing-page/, │
 * │ add an entry to `photos` (copy one and change it), then use its  │
 * │ name in `SPREAD`. Width and height are the file's pixel size —   │
 * │ Finder's Get Info shows it, or run                               │
 * │   sips -g pixelWidth -g pixelHeight <file>                       │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * The spread is always five tiles: the first is the large one on the
 * left, the next two stack beside it, and the last two share the row
 * beneath. Any shape of photo works — each tile crops to fit, and
 * `focus` moves the crop if the important part gets cut off.
 *
 * The line-up shot above the medals is separate (`lineupPhoto`). The
 * cider names under it are listed in `components/press-house/home/
 * lineup-shelf.tsx` in the order the cans stand in the photo, so a new
 * line-up photo means updating that list too.
 *
 * The rugby sponsorship shot is deliberately not here: no product in
 * frame and a crowd of identifiable people.
 */

/** The five tiles in the photo spread, in order. */
const SPREAD: Five<PhotoName> = [
  "orchard",
  "captains",
  "heirloom",
  "canWall",
  "rareApple",
];

export type HomePhoto = {
  src: string;
  /** Describes the photo for screen readers and search engines. */
  alt: string;
  /** The caption on the tile, which is also its link text. */
  label: string;
  /** Where the tile goes when clicked. */
  href: string;
  width: number;
  height: number;
  /**
   * Which part of the photo to keep when a tile crops it, as a CSS
   * object-position: "50% 50%" is the centre, "50% 80%" keeps more of
   * the bottom. Leave it out for the centre.
   */
  focus?: string;
};

type Five<T> = [T, T, T, T, T];
type PhotoName = keyof typeof photos;

const DIR = "/images/landing-page";

/**
 * Every photo available to the home page, year-round and seasonal
 * alike. Only the ones named in `SPREAD` are shown.
 */
const photos = {
  // Year-round
  orchard: {
    src: `${DIR}/legendary-dry-landing.jpg`,
    alt: "Three cans of Legendary Dry and a full glass on an old barrel head, surrounded by apples, with an orchard behind",
    label: "Legendary Dry",
    href: "/ciders/legendary-dry",
    width: 3000,
    height: 1875,
    focus: "50% 60%",
  },
  captains: {
    src: `${DIR}/award-winning-landing.jpg`,
    alt: "Cans of Mass Appeal, Legendary Dry and Red Skies at Night between two carved wooden figures, a sea captain and a fisherman in oilskins, on a harbor dock",
    label: "Award winners",
    href: "/ciders#awards",
    width: 6215,
    height: 4081,
    focus: "50% 55%",
  },
  heirloom: {
    src: `${DIR}/boston-heirloom-landing.jpg`,
    alt: "A can of Boston Heirloom on a windowsill beside a weathered fisherman figurine in a yellow oilskin and a small carved whale",
    label: "Boston Heirloom",
    href: "/ciders/boston-heirloom",
    width: 3000,
    height: 1500,
    focus: "45% 50%",
  },
  canWall: {
    src: `${DIR}/farm-stand-landing.jpg`,
    alt: "A wall of stacked Farmstand Unfiltered cans",
    label: "Farmstand Unfiltered",
    href: "/ciders/farmstand-unfiltered",
    width: 3000,
    height: 1660,
  },
  rareApple: {
    src: "/images/cider-club/3-drinks-rare-apple.jpg",
    alt: "Two bottles and a can from the Rare Apple Series on a wooden shelf beside a carved sea captain figure and weathered wooden floats",
    label: "Rare Apple Series",
    href: "/releases",
    width: 3000,
    height: 2250,
    focus: "50% 55%",
  },
  lineup: {
    src: `${DIR}/lineup-2025.jpg`,
    alt: "Five cans in a row on a dock by the water: Light of the Sun, Mass Appeal, Legendary Dry, Red Skies at Night and Farmstand Unfiltered",
    label: "The line-up",
    href: "/ciders",
    width: 3000,
    height: 1320,
  },

  // Seasonal — pumpkins and holidays read as out of date the rest of
  // the year, so swap these in for their season and back out after.
  farmstandFall: {
    src: `${DIR}/farmstand-fall.jpg`,
    alt: "Three cans of Farmstand Unfiltered on the tailgate of a red pickup, among pumpkins beside a farm stand chalkboard",
    label: "Farmstand Unfiltered",
    href: "/ciders/farmstand-unfiltered",
    width: 3000,
    height: 1320,
    focus: "60% 50%",
  },
  holidaysPumpkins: {
    src: `${DIR}/happy-holidays-fall.jpg`,
    alt: "Three cans of Happy Holidays among pumpkins and gourds in front of a red truck",
    label: "Happy Holidays",
    href: "/ciders/happy-holidays",
    width: 3000,
    height: 1320,
  },
  holidaysPie: {
    src: `${DIR}/happy-holidays-landing.jpg`,
    alt: "A can and a mug of Happy Holidays on a table with apples and slices of apple strudel",
    label: "Happy Holidays",
    href: "/ciders/happy-holidays",
    width: 3000,
    height: 1600,
    focus: "35% 50%",
  },
  snow: {
    src: `${DIR}/white-mountain-magic-landing.jpg`,
    alt: "Two cans of White Mountain Magic standing in fresh snow beside a frozen waterfall",
    label: "White Mountain Magic",
    href: "/ciders/white-mountain-magic",
    width: 6720,
    height: 3967,
    focus: "60% 60%",
  },
} satisfies Record<string, HomePhoto>;

/** The photo spread, in the order `SPREAD` lists it. */
export const spreadPhotos: HomePhoto[] = SPREAD.map((name) => photos[name]);

/** The wide shot above the medals, under At a Glance. */
export const lineupPhoto: HomePhoto = photos.lineup;
