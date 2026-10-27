/**
 * The package listing query, shared by /api/packages and by the server
 * components that prerender the listing pages.
 *
 * It lived only inside the route handler, which meant /tours and /destinations
 * could not render any packages on the server: they shipped skeletons and the
 * browser then fetched the same rows over HTTP. Pulling it out lets both call
 * one cached implementation, so the markup arrives complete and the logic
 * cannot drift between the two paths.
 */
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withDbRetry } from "@/lib/db-retry"
import { upcomingDeparturesOnly, parseDepartureDates } from "@/lib/departures"
import { PAGE_REVALIDATE } from "@/lib/home-data"

export interface PackageQuery {
    destinationId?: number
    country?: string
    region?: string
    excludeCountry?: string
    search?: string
    tourType?: string
    tourCategory?: string
    departureType?: string
    saleSlug?: string
    minPrice?: number
    maxPrice?: number
    duration?: string
    page?: number
    /** 0 or undefined means "no pagination". */
    limit?: number
    sortBy?: string
}

export interface PackageListResult {
    packages: Record<string, unknown>[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/** Day bounds for the duration filter buckets the UI offers. */
function durationBounds(duration: string): [number, number] {
    if (duration.includes("1-3")) return [0, 3]
    if (duration.includes("4-7")) return [4, 7]
    if (duration.includes("8-14")) return [8, 14]
    if (duration.includes("15-21")) return [15, 21]
    if (duration.includes("22+")) return [22, 1000]
    return [0, 1000]
}

async function queryPackages(q: PackageQuery): Promise<PackageListResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (q.destinationId) where.destinationId = q.destinationId

    if (q.country || q.region || q.excludeCountry) {
        where.destination = {}
        if (q.country) where.destination.country = q.country
        if (q.region) where.destination.region = q.region
        // Exclusion wins over an explicit country, matching the original route:
        // the "international" filter asks for everything except India.
        if (q.excludeCountry) where.destination.country = { not: q.excludeCountry }
    }

    if (q.search) {
        where.OR = [
            { title: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
            { cities: { contains: q.search, mode: "insensitive" } },
            { destination: { name: { contains: q.search, mode: "insensitive" } } },
            { destination: { country: { contains: q.search, mode: "insensitive" } } },
            { destination: { region: { contains: q.search, mode: "insensitive" } } },
        ]
    }

    if (q.tourType) where.tourType = { contains: q.tourType }
    if (q.tourCategory) where.tourCategory = q.tourCategory
    if (q.departureType) where.departureType = q.departureType
    if (q.saleSlug) where.sales = { some: { slug: q.saleSlug } }

    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
        where.price = {}
        if (q.minPrice !== undefined) where.price.gte = q.minPrice
        if (q.maxPrice !== undefined) where.price.lte = q.maxPrice
    }

    let orderBy: object = { createdAt: "desc" } // default: popular / recommended
    if (q.sortBy === "price-low") orderBy = { price: "asc" }
    else if (q.sortBy === "price-high") orderBy = { price: "desc" }
    else if (q.sortBy === "rating") orderBy = { rating: "desc" }

    const packages = await prisma.package.findMany({
        where,
        select: {
            id: true, title: true, description: true, price: true,
            originalPrice: true, duration: true, cities: true, rating: true,
            image: true, mapImage: true, galleryImages: true, tourType: true,
            tourCategory: true, maxPersons: true, accommodation: true,
            ageRange: true, discountPercent: true, tags: true,
            isCustomizable: true, bestPrice: true, departureDates: true,
            departureType: true,
            destination: {
                select: { id: true, name: true, country: true, region: true },
            },
            reviews: { select: { rating: true } },
        },
        orderBy,
    })

    // Duration is a free-text column ("7 Days"), so it is filtered and sorted
    // in memory rather than in SQL.
    let filtered = packages
    if (q.duration) {
        const [min, max] = durationBounds(q.duration)
        filtered = packages.filter((pkg) => {
            const days = parseInt(pkg.duration) || 0
            return days >= min && days <= max
        })
    }
    if (q.sortBy === "duration") {
        filtered = [...filtered].sort(
            (a, b) => (parseInt(a.duration) || 0) - (parseInt(b.duration) || 0)
        )
    }

    // The default sort spreads results across destinations. The callers spell
    // that default differently — /api/packages sends "popular", the server
    // components send nothing — so all three spellings count as default. An
    // explicit price/rating/duration sort is the user's instruction and is
    // left alone.
    if (!q.sortBy || q.sortBy === "recommended" || q.sortBy === "popular") {
        filtered = spreadAcrossDestinations(filtered)
    }

    const total = filtered.length
    const limit = q.limit ?? 0
    const page = q.page ?? 1
    const paginated =
        limit > 0 ? filtered.slice((page - 1) * limit, (page - 1) * limit + limit) : filtered

    const transformed = paginated.map((pkg) => {
        const avgRating =
            pkg.reviews.length > 0
                ? pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length
                : pkg.rating || 0

        return {
            ...pkg,
            rating: avgRating,
            reviewCount: pkg.reviews.length,
            tags: pkg.tags ? pkg.tags.split(",").map((t) => t.trim()) : [],
            destinations: pkg.cities ? pkg.cities.split(",").map((c) => c.trim()) : [],
            galleryImages: pkg.galleryImages
                ? pkg.galleryImages.split(",").map((img) => img.trim()).filter(Boolean)
                : [],
            upcomingDepartures: upcomingDeparturesOnly(parseDepartureDates(pkg.departureDates)),
            originalPrice: pkg.originalPrice,
            saving:
                pkg.originalPrice && pkg.originalPrice > pkg.price
                    ? Math.round(pkg.originalPrice - pkg.price)
                    : 0,
        }
    })

    return {
        packages: transformed,
        total,
        page,
        limit,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    }
}

// The query signature is part of the cache key, so each distinct filter
// combination is cached separately.
const loadPackages = unstable_cache(queryPackages, ["packages-list"], {
    revalidate: PAGE_REVALIDATE,
    tags: ["packages"],
})

/**
 * Cached package listing. Returns null if the read failed, so a caller can
 * fall back to fetching on the client rather than rendering an empty list.
 */
/**
 * Spreads a listing across its destinations instead of letting one fill the top.
 *
 * The default sort is newest-first, and on a region page that meant the top of
 * /destinations?region=Asia was Ladakh, Ladakh, Spiti — three India trips —
 * while Vietnam sat below the fold. India holds 39 of 41 packages, so date
 * order is effectively country order.
 *
 * Two rules, applied to the destination groups rather than to packages:
 * countries other than the listing's dominant one come first, then smaller
 * catalogues, then one package is taken from each group in turn. Every
 * destination therefore appears before any destination appears twice, and the
 * order within a destination stays whatever the caller asked for.
 */
function spreadAcrossDestinations<
    T extends { destination?: { id: number; name: string; country: string | null } | null }
>(packages: T[]): T[] {
    if (packages.length < 2) return packages

    const groups = new Map<number, T[]>()
    for (const pkg of packages) {
        const key = pkg.destination?.id ?? -1
        const group = groups.get(key)
        if (group) group.push(pkg)
        else groups.set(key, [pkg])
    }
    if (groups.size < 2) return packages

    const byCountry = new Map<string, number>()
    for (const pkg of packages) {
        const country = pkg.destination?.country ?? ""
        byCountry.set(country, (byCountry.get(country) ?? 0) + 1)
    }
    let dominant = ""
    let best = -1
    for (const [country, count] of byCountry) {
        if (count > best) {
            best = count
            dominant = country
        }
    }

    const ordered = [...groups.values()].sort((a, b) => {
        const aDominant = (a[0].destination?.country ?? "") === dominant ? 1 : 0
        const bDominant = (b[0].destination?.country ?? "") === dominant ? 1 : 0
        if (aDominant !== bDominant) return aDominant - bDominant
        if (a.length !== b.length) return a.length - b.length
        return (a[0].destination?.name ?? "").localeCompare(b[0].destination?.name ?? "")
    })

    const out: T[] = []
    for (let round = 0; out.length < packages.length; round++) {
        for (const group of ordered) {
            if (round < group.length) out.push(group[round])
        }
    }
    return out
}


export async function getPackagesList(q: PackageQuery): Promise<PackageListResult | null> {
    try {
        return await withDbRetry(() => loadPackages(q), { label: "getPackagesList" })
    } catch (error) {
        console.error("getPackagesList failed:", error)
        return null
    }
}
