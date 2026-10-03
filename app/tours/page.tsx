import type { Metadata } from "next"
import { getDestinationSeo } from "../destinations/destination-seo"
import ToursClient from "./ToursClient"

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
        images: ["/og-image.jpg"],
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
            images: ["/og-image.jpg"],
        },
    }
}

export default function ToursPage() {
    return <ToursClient />
}
