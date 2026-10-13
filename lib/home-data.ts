/**
 * Server-side data loaders for the statically rendered pages.
 *
 * The homepage and listing pages used to fetch everything from the browser
 * through RTK Query, so a visitor waited for JS, then for the section to
 * scroll into view, then for an API round trip before seeing any content.
 * These loaders run the same queries at build and revalidation time instead,
 * so the HTML ships complete.
 *
 * Each loader is split in two deliberately:
 *
 *   load*  the cached query. It lets errors propagate, because unstable_cache
 *          does not store a rejected promise. An earlier version caught inside
 *          the cache and returned null, which meant one failed build cached the
 *          failure and kept serving an empty homepage long after the database
 *          recovered.
 *   get*   the public wrapper. It turns a failure into null, which the caller
 *          treats as "no server data" and falls back to fetching on the client.
 *
 * null therefore means "the read failed", not "there is nothing", and nothing
 * here ever throws at a page.
 */
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withDbRetry } from "@/lib/db-retry"

/** How long a prerendered page is served before it is rebuilt, in seconds. */
export const PAGE_REVALIDATE = 300

/** Wraps a cached loader so a failed read becomes null instead of a 500. */
function safely<T>(name: string, load: () => Promise<T>): () => Promise<T | null> {
    return async () => {
        try {
            // Retried first: connection exhaustion is transient, and giving up
            // on the first failure would cache nothing for a whole window.
            return await withDbRetry(load, { label: name })
        } catch (error) {
            console.error(`${name} failed:`, error)
            return null
        }
    }
}

export interface BudgetStats {
    domestic: { totalTours: number; budgetCounts: Record<number, number> }
    international: { totalTours: number; budgetCounts: Record<number, number> }
}

const loadBudgetStats = unstable_cache(
    async (): Promise<BudgetStats> => {
        const packages = await prisma.package.findMany({
            select: { price: true, destination: { select: { country: true } } },
        })

        const domesticBudgets = [10000, 20000, 30000, 50000]
        const internationalBudgets = [30000, 50000, 75000, 100000]
        const isIndia = (c?: string | null) => c?.toLowerCase() === "india"

        const domestic = packages.filter((p) => isIndia(p.destination?.country))
        const international = packages.filter((p) => !isIndia(p.destination?.country))

        const countByBudget = (pkgs: typeof packages, budgets: number[]) =>
            Object.fromEntries(budgets.map((b) => [b, pkgs.filter((p) => p.price <= b).length]))

        return {
            domestic: {
                totalTours: domestic.length,
                budgetCounts: countByBudget(domestic, domesticBudgets),
            },
            international: {
                totalTours: international.length,
                budgetCounts: countByBudget(international, internationalBudgets),
            },
        }
    },
    ["budget-stats"],
    { revalidate: PAGE_REVALIDATE, tags: ["packages"] }
)
export const getBudgetStats = safely("getBudgetStats", loadBudgetStats)

/** Package counts per tour type, e.g. { Family: 12, Luxury: 4 }. */
const loadTourTypeStats = unstable_cache(
    async (): Promise<Record<string, number>> => {
        const defaults = [
            "Family", "Couples", "Friends", "Adventure",
            "Cultural & Architecture", "Pilgrim Tours", "Luxury", "Instagrammable",
        ]
        const result: Record<string, number> = Object.fromEntries(defaults.map((t) => [t, 0]))

        const packages = await prisma.package.findMany({ select: { tourType: true } })
        for (const pkg of packages) {
            if (!pkg.tourType) continue
            for (const type of pkg.tourType.split(",").map((t) => t.trim())) {
                if (type) result[type] = (result[type] || 0) + 1
            }
        }
        return result
    },
    ["tour-type-stats"],
    { revalidate: PAGE_REVALIDATE, tags: ["packages"] }
)
export const getTourTypeStats = safely("getTourTypeStats", loadTourTypeStats)

export interface DestinationCard {
    id: number
    name: string
    description: string | null
    country: string | null
    city: string | null
    region: string | null
    image: string | null
    rating: number | null
    popularity: number | null
    tours: number
}

const loadDestinations = unstable_cache(
    async (): Promise<DestinationCard[]> => {
        const destinations = await prisma.destination.findMany({
            orderBy: { popularity: "desc" },
            select: {
                id: true, name: true, description: true, country: true,
                city: true, region: true, image: true, rating: true,
                popularity: true, _count: { select: { packages: true } },
            },
        })
        return destinations.map(({ _count, ...dest }) => ({
            ...dest,
            tours: _count.packages,
        }))
    },
    ["destinations-list"],
    { revalidate: PAGE_REVALIDATE, tags: ["destinations"] }
)
export const getDestinations = safely("getDestinations", loadDestinations)

export interface FeatureBox {
    id: number
    title: string
    description: string | null
    icon: string
    order: number
    isActive: boolean
}

const loadFeatureBoxes = unstable_cache(
    async (): Promise<FeatureBox[]> => {
        const boxes = await prisma.featureBox.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: {
                id: true, title: true, description: true,
                icon: true, order: true, isActive: true,
            },
        })
        // The component picks an icon component by name, so a null icon
        // becomes "" and falls through to its default.
        return boxes.map((b) => ({ ...b, icon: b.icon ?? "" }))
    },
    ["feature-boxes"],
    { revalidate: PAGE_REVALIDATE, tags: ["feature-boxes"] }
)
export const getFeatureBoxes = safely("getFeatureBoxes", loadFeatureBoxes)

const HERO_FALLBACK =
    "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880458/TravPlan/stock/unsplash-1764276266750-4d6316e972e0.jpg"

const loadHomepageSettings = unstable_cache(
    async (): Promise<Record<string, string>> => {
        const settings = await prisma.siteSetting.findMany({
            where: {
                key: { in: ["heroBackgroundImage", "heroTitle", "heroSubtitle", "bannerImage"] },
            },
        })
        const found = Object.fromEntries(settings.map((s) => [s.key, s.value]))
        return { heroBackgroundImage: HERO_FALLBACK, ...found }
    },
    ["homepage-settings"],
    { revalidate: PAGE_REVALIDATE, tags: ["homepage-settings"] }
)
export const getHomepageSettings = safely("getHomepageSettings", loadHomepageSettings)

export interface VideoReview {
    id: number
    video: string
    name: string
    destination: string
}

const loadVideoReviews = unstable_cache(
    async (): Promise<VideoReview[]> => {
        const reviews = await prisma.review.findMany({
            where: { video: { not: null } },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: {
                id: true, video: true, destination: true, userName: true,
                user: { select: { name: true } },
            },
        })
        // r.user is nullable — a review can outlive the account that left it.
        return reviews.map((r) => ({
            id: r.id,
            video: r.video!,
            name: r.user?.name || r.userName || "Traveler",
            destination: r.destination || "Unknown",
        }))
    },
    ["video-reviews"],
    { revalidate: PAGE_REVALIDATE, tags: ["reviews"] }
)
export const getVideoReviews = safely("getVideoReviews", loadVideoReviews)

export interface TravellerPhoto {
    id: string
    image: string
    title: string
    name: string
}

const loadTravellerPhotos = unstable_cache(
    async (): Promise<TravellerPhoto[]> => {
        const reviews = await prisma.review.findMany({
            where: { OR: [{ image: { not: null } }, { images: { not: null } }] },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: {
                id: true, image: true, images: true, comment: true,
                userName: true, user: { select: { name: true } },
            },
        })

        const photos: TravellerPhoto[] = []
        for (const r of reviews) {
            const name = r.user?.name || r.userName || "Traveler"
            const title = r.comment ? r.comment.slice(0, 50) : "Traveler Photo"
            if (r.images) {
                r.images.split(",").forEach((img, idx) => {
                    const src = img.trim()
                    if (src) photos.push({ id: `${r.id}-${idx}`, image: src, title, name })
                })
            } else if (r.image) {
                photos.push({ id: String(r.id), image: r.image, title, name })
            }
        }
        return photos.slice(0, 12)
    },
    ["traveller-photos"],
    { revalidate: PAGE_REVALIDATE, tags: ["reviews"] }
)
export const getTravellerPhotos = safely("getTravellerPhotos", loadTravellerPhotos)

export interface ExpertCard {
    id: number
    name: string
    email: string | null
    avatar: string | null
    bio: string | null
    expertise: string[]
    whatsappNumber: string | null
    type: string
    isActive: boolean
    order: number
    destinationId: number | null
    createdAt: Date
}

/**
 * Active trip experts, optionally narrowed to DOMESTIC / INTERNATIONAL or to
 * one destination. Mirrors the shape /api/admin/experts returns, including the
 * comma-separated expertise string split into an array.
 */
const loadExperts = unstable_cache(
    async (opts: { type?: string; destinationId?: number } = {}): Promise<ExpertCard[]> => {
        const experts = await prisma.tripExpert.findMany({
            where: {
                isActive: true,
                ...(opts.type ? { type: opts.type.toUpperCase() } : {}),
                ...(opts.destinationId ? { destinationId: opts.destinationId } : {}),
            },
            orderBy: { order: "asc" },
            select: {
                id: true, name: true, email: true, avatar: true, bio: true,
                expertise: true, whatsappNumber: true, type: true,
                isActive: true, order: true, destinationId: true, createdAt: true,
            },
        })
        return experts.map((e) => ({
            ...e,
            expertise: e.expertise ? e.expertise.split(",").map((x) => x.trim()) : [],
        }))
    },
    ["experts"],
    { revalidate: PAGE_REVALIDATE, tags: ["experts"] }
)

export async function getExperts(
    opts: { type?: string; destinationId?: number } = {}
): Promise<ExpertCard[] | null> {
    try {
        return await withDbRetry(() => loadExperts(opts), { label: "getExperts" })
    } catch (error) {
        console.error("getExperts failed:", error)
        return null
    }
}
