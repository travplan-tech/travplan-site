import type { Metadata } from "next"
import { getDestinationSeo } from "../destinations/destination-seo"
import ToursClient from "./ToursClient"
import { getPackagesList, type PackageQuery } from "@/lib/packages-data"

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0]
    return value || undefined
}

const BASE: Metadata = {
    title: { absolute: "Tour Packages & Group Departures | Travplan" },
    description:
        "Browse Travplan tour packages, group departures and holiday trips. Find curated routes, inclusions, travel dates and enquiry options.",
    alternates: { canonical: "/tours" },
    openGraph: {
        title: "Tour Packages & Group Departures | Travplan",
        description:
            "Browse Travplan tour packages, group departures and holiday trips. Find curated routes, inclusions and travel dates.",
        url: "/tours",
        type: "website",
        images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
    },
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}): Promise<Metadata> {
    const params = await searchParams
    const search = first(params.search)?.trim()
    const hasFilters = Object.keys(params).length > 0

    if (!search) {
        // Filtered views are refinements of /tours, not separate landing pages.
        return hasFilters
            ? { ...BASE, robots: { index: false, follow: true } }
            : BASE
    }

    // "Kashmir, India" -> "Kashmir": the search box submits the full label.
    const term = search.split(",")[0].trim()
    const seo = getDestinationSeo(term)

    return {
        title: { absolute: seo.title },
        description: seo.description,
        // Internal search results are an unbounded URL space, so they stay out
        // of the index and point at the hub. A destination that deserves its own
        // page should get a real route rather than an indexed search URL.
        alternates: { canonical: "/tours" },
        robots: { index: false, follow: true },
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: "/tours",
            type: "website",
            images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
        },
    }
}

/**
 * Mirrors the query ToursContent builds on its first render, so the server can
 * prefetch exactly the rows the client is about to ask for. Keep the two in
 * step: a mismatch is harmless — the signature will not match and the client
 * simply fetches — but it costs the prerendered listing.
 */
function initialQuery(params: SearchParams): PackageQuery {
    const budgetType = first(params.type)
    const destinationId = first(params.destinationId)
    const country = budgetType === "domestic" ? "India" : first(params.country)
    const excludeCountry = budgetType === "international" ? "India" : undefined
    const region = first(params.region)

    const query: PackageQuery = {
        page: 1,
        limit: 10,
        sortBy: first(params.sortBy) || "popular",
    }

    if (destinationId) {
        query.destinationId = Number(destinationId)
    } else {
        if (country && !excludeCountry) query.country = country
        if (region) query.region = region
    }
    if (excludeCountry) query.excludeCountry = excludeCountry

    const saleSlug = first(params.saleSlug)
    if (saleSlug) query.saleSlug = saleSlug
    const duration = first(params.duration)
    if (duration) query.duration = duration
    const tourType = first(params.tourType)
    if (tourType) query.tourType = tourType
    const search = first(params.search)
    if (search) query.search = search
    // maxPrice is deliberately omitted: the client only sends it once the
    // price slider has moved below the maximum the filters API reports, which
    // cannot have happened on the first render.

    return query
}

/** Canonical signature of a query, matching the client's. */
function signatureOf(query: PackageQuery): string {
    return JSON.stringify(
        Object.entries(query)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))
    )
}

export default async function ToursPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const query = initialQuery(params)
    const result = await getPackagesList(query)

    // Reshape to the envelope the API returns, which is what the client reads.
    const initialData = result
        ? {
            packages: result.packages,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        }
        : undefined

    return (
        <ToursClient
            initialData={initialData}
            initialSignature={initialData ? signatureOf(query) : undefined}
        />
    )
}
