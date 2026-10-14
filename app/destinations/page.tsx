import type { Metadata } from "next"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getDestinationSeo } from "./destination-seo"
import DestinationsClient from "./DestinationsClient"
import { PAGE_REVALIDATE, getDestinations } from "@/lib/home-data"
import { getPackagesList } from "@/lib/packages-data"
import { getDestinationFacts } from "@/lib/destination-facts"

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0]
    return value || undefined
}

/**
 * Counts live packages for a country or region, used to avoid indexing empty
 * pages. Cached per country/region: this runs on every request to
 * /destinations, and the count only moves when inventory changes.
 */
const countPackages = unstable_cache(
    async (where: { country?: string; region?: string }): Promise<number | null> => {
        try {
            return await prisma.package.count({
                where: { destination: { is: where } },
            })
        } catch (error) {
            // If the database is unreachable, fall back to indexing rather than
            // accidentally de-indexing a page that does have inventory.
            console.error("destinations metadata: package count failed", error)
            return null
        }
    },
    ["destinations-package-count"],
    { revalidate: PAGE_REVALIDATE, tags: ["packages"] }
)

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}): Promise<Metadata> {
    const params = await searchParams
    const country = first(params.country)
    const region = first(params.region)
    const tourType = first(params.tourType)
    const tourCategory = first(params.tourCategory)

    // Only country and region get their own indexable landing page. Every other
    // filter combination is a refinement of one of those, so it points its
    // canonical at the unfiltered page instead of creating near-duplicates.
    const place = country || region

    if (!place) {
        return {
            title: { absolute: "Travel Destinations & Tour Packages | Travplan" },
            description:
                "Explore Travplan tour packages by destination. Compare India and international trips, routes, durations, inclusions and enquiry options.",
            alternates: { canonical: "/destinations" },
            robots: tourType || tourCategory ? { index: false, follow: true } : undefined,
            openGraph: {
                title: "Travel Destinations & Tour Packages | Travplan",
                description:
                    "Explore Travplan tour packages by destination. Compare India and international trips, routes, durations and inclusions.",
                url: "/destinations",
                type: "website",
                images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
            },
        }
    }

    const seo = getDestinationSeo(place)
    const key = country ? "country" : "region"
    const canonical = `/destinations?${key}=${encodeURIComponent(place)}`

    // A destination page with no packages is a thin page — keep it out of the
    // index until inventory exists, then it becomes indexable on its own.
    const packageCount = await countPackages(
        country ? { country } : { region: region as string }
    )
    const isThin = packageCount === 0
    // Filter refinements on top of a destination are not separate landing pages.
    const isRefinement = Boolean(tourType || tourCategory)

    return {
        title: { absolute: seo.title },
        description: seo.description,
        alternates: { canonical },
        robots: isThin || isRefinement ? { index: false, follow: true } : undefined,
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: canonical,
            type: "website",
            images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
        },
    }
}

export default async function DestinationsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const country = first(params.country)
    const region = first(params.region)

    // Mirrors the query BestTours builds, so the cards are in the HTML rather
    // than fetched after hydration.
    const [result, destinations] = [
        await getPackagesList({
            country,
            region,
            tourCategory: first(params.tourCategory),
            excludeCountry: first(params.excludeCountry),
            tourType: first(params.tourType),
            limit: 6,
        }),
        // Only needed to resolve the hero image for a country or region page.
        country || region ? await getDestinations() : null,
    ]

    // Planning copy built from real inventory, replacing the generic
    // "Browse our curated collection" line.
    const place = country || region
    const facts = place
        ? await getDestinationFacts(country ? { country } : { region: region as string }, place)
        : null

    const heroImage = destinations?.find((d) =>
        country
            ? d.country?.toLowerCase() === country.toLowerCase()
            : d.region?.toLowerCase() === region?.toLowerCase()
    )?.image

    return (
        <DestinationsClient
            initialPackages={result?.packages}
            initialImage={heroImage ?? undefined}
            initialIntro={facts?.intro}
        />
    )
}
