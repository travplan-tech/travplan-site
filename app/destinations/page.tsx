import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getDestinationSeo } from "./destination-seo"
import DestinationsClient from "./DestinationsClient"

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0]
    return value || undefined
}

/** Counts live packages for a country or region, used to avoid indexing empty pages. */
async function countPackages(where: { country?: string; region?: string }): Promise<number | null> {
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
}

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
                images: ["/og-image.jpg"],
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
            images: ["/og-image.jpg"],
        },
    }
}

export default function DestinationsPage() {
    return <DestinationsClient />
}
