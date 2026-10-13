/**
 * Cloudinary folder layout for the media library.
 *
 * The cloud grew organically and the app's media is spread across several
 * top-level folders — `TravPlan`, a legacy lowercase `Travplan`, plus the older
 * `packages` and `video-testimonials` trees — with a handful of assets sitting
 * at the cloud root. Whitelisting folders hid all of those, so the library
 * instead shows everything *except* Cloudinary's own `samples` demo content.
 */

/** Cloudinary's bundled demo content, which is not ours and not useful here. */
const EXCLUDED_FOLDERS = ["samples"]

/** New uploads are organised under here. Note the capital P. */
export const ROOT_FOLDER = "TravPlan"

/** Top-level folders worth offering as filters. */
export const BROWSE_FOLDERS = [
    "TravPlan",
    "packages",
    "video-testimonials",
    "Travplan",
] as const

/** Destinations offered in the "upload to" pickers. */
export const UPLOAD_FOLDERS = [
    { label: "General", value: "TravPlan/site" },
    { label: "Destinations", value: "TravPlan/destinations" },
    { label: "Stock photos", value: "TravPlan/stock" },
    { label: "Packages", value: "packages" },
    { label: "Package galleries", value: "packages/gallery" },
    { label: "Package maps", value: "packages/maps" },
    { label: "Package charts", value: "packages/charts" },
    { label: "Experts", value: "TravPlan/experts" },
    { label: "Blog covers", value: "TravPlan/blog" },
    { label: "Video testimonials", value: "video-testimonials" },
]

/**
 * True unless the path is inside an excluded folder. Used to stop a crafted
 * request reaching Cloudinary content the app does not own.
 */
export function isAppFolder(path: string): boolean {
    return !EXCLUDED_FOLDERS.some((root) => path === root || path.startsWith(`${root}/`))
}

/** A Cloudinary search expression covering everything the app owns. */
export function appFolderExpression(): string {
    return EXCLUDED_FOLDERS.map((f) => `-folder:${f}/*`).join(" AND ")
}

/**
 * Rewrites a Cloudinary URL to deliver a small thumbnail.
 *
 * The library stores full-resolution masters — some are several megabytes — so
 * a grid of 30 raw URLs makes the browser (or Next's image optimiser) pull
 * hundreds of megabytes just to draw postage stamps. Asking Cloudinary for a
 * cropped, auto-encoded version instead keeps each one in the tens of
 * kilobytes. A non-Cloudinary or already-transformed URL is returned unchanged.
 */
export function thumbnailUrl(url: string, width = 400): string {
    if (!url.includes("res.cloudinary.com")) return url
    return url.replace(
        /\/(image|video)\/upload\/(?!(?:[a-z]+_[^/]+\/))/,
        `/$1/upload/f_auto,q_auto,c_fill,w_${width},h_${width}/`
    )
}
