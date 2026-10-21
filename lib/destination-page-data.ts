/**
 * Server-side data for destination landing pages.
 *
 * These pages were client-rendered, which meant a crawler saw an empty shell:
 * no destination name, no trips, no copy. Everything needed to render one is
 * loaded here so the markup arrives complete.
 *
 * Loaders throw on failure rather than returning null. An unstable_cache that
 * resolves with null caches the failure, and a destination page cached empty
 * stays empty until the next revalidation — which is how the homepage once
 * served a blank build for hours.
 */
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withDbRetry } from "@/lib/db-retry"
import { PAGE_REVALIDATE } from "@/lib/home-data"
import { destinationSlug, matchBySlug } from "@/lib/destination-slug"
import { upcomingDeparturesOnly, parseDepartureDates } from "@/lib/departures"

export interface DestinationRow {
    id: number
    name: string
    description: string | null
    country: string | null
    city: string | null
    region: string | null
    image: string | null
    slug: string
}

export interface DestinationPackage {
    id: number
    title: string
    duration: string
    price: number
    originalPrice: number | null
    image: string | null
    rating: number
    tourType: string | null
    tourCategory: string | null
    cities: string | null
    departureCount: number
    reviewCount: number
}

export interface DestinationBlogCard {
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    readingMinutes: number
    publishedAt: Date | null
}

/** Every destination, used for generateStaticParams and for slug resolution. */
export const getAllDestinations = unstable_cache(
    async (): Promise<DestinationRow[]> => {
        const rows = await withDbRetry(
            () =>
                prisma.destination.findMany({
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        country: true,
                        city: true,
                        region: true,
                        image: true,
                    },
                    orderBy: { id: "asc" },
                }),
            { label: "getAllDestinations" }
        )
        return rows.map((d) => ({ ...d, slug: destinationSlug(d.name) }))
    },
    ["all-destinations"],
    { revalidate: PAGE_REVALIDATE, tags: ["destinations"] }
)

export async function getDestinationBySlug(slug: string): Promise<DestinationRow | null> {
    const all = await getAllDestinations()
    return matchBySlug(all, slug) ?? null
}

export const getDestinationPackages = unstable_cache(
    async (destinationId: number): Promise<DestinationPackage[]> => {
        const rows = await withDbRetry(
            () =>
                prisma.package.findMany({
                    where: { destinationId },
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        price: true,
                        originalPrice: true,
                        image: true,
                        rating: true,
                        tourType: true,
                        tourCategory: true,
                        cities: true,
                        departureDates: true,
                        _count: { select: { reviews: true } },
                    },
                    orderBy: [{ price: "asc" }, { id: "asc" }],
                }),
            { label: "getDestinationPackages" }
        )

        return rows.map(({ departureDates, _count, ...p }) => ({
            ...p,
            reviewCount: _count.reviews,
            // Past departures are filtered out here so a page can never
            // advertise a date that has already gone.
            departureCount: upcomingDeparturesOnly(parseDepartureDates(departureDates)).length,
        }))
    },
    ["destination-packages"],
    { revalidate: PAGE_REVALIDATE, tags: ["packages"] }
)

/**
 * Posts written about this destination, newest first.
 *
 * Only posts explicitly linked to the destination are returned. Matching on
 * title or tags would pull in loosely related posts and make the section feel
 * automated, which is the opposite of what it is for.
 */
export const getDestinationBlogs = unstable_cache(
    async (destinationId: number): Promise<DestinationBlogCard[]> =>
        withDbRetry(
            () =>
                prisma.blog.findMany({
                    where: { destinationId, isPublished: true },
                    select: {
                        slug: true,
                        title: true,
                        excerpt: true,
                        coverImage: true,
                        readingMinutes: true,
                        publishedAt: true,
                    },
                    orderBy: { publishedAt: "desc" },
                    take: 3,
                }),
            { label: "getDestinationBlogs" }
        ),
    ["destination-blogs"],
    { revalidate: PAGE_REVALIDATE, tags: ["blogs"] }
)

/** Other destinations in the same country, for internal linking. */
export async function getSiblingDestinations(
    destination: DestinationRow,
    limit = 6
): Promise<DestinationRow[]> {
    const all = await getAllDestinations()
    return all
        .filter((d) => d.id !== destination.id && d.country === destination.country)
        .slice(0, limit)
}
