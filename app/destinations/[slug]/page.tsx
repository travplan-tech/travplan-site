import type { Metadata } from "next"
import { notFound } from "next/navigation"
import DestinationHero from "@/components/destination-hero-featured"
import DestinationTrips from "@/components/destination-trips"
import DestinationInterests from "@/components/destination-interests"
import DestinationPlan from "@/components/destination-plan"
import FAQ from "@/components/faq"
import { SITE_URL } from "@/lib/site"
import { getDestinationSeo } from "../destination-seo"
import { getDestinationGuide } from "@/lib/destination-content"
import { isPriceOnRequest } from "@/lib/pricing"
import {
    getAllDestinations,
    getDestinationBlogs,
    getDestinationBySlug,
    getDestinationPackages,
    getSiblingDestinations,
} from "@/lib/destination-page-data"
import {
    BestTimeToVisit,
    DaysNeeded,
    DestinationBlogs,
    DestinationGuideFaqs,
    DestinationIntro,
    SiblingDestinations,
    ThingsToDo,
} from "@/components/destination-guide-sections"

// Must be a literal: Next statically analyses this export, and an imported
// constant fails the build with "Invalid segment configuration export".
export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
    const destinations = await getAllDestinations()
    return destinations.map((d) => ({ slug: d.slug }))
}

/** Pulls the day count out of strings like "5N/6D" or "6 Days". */
function parseDays(duration?: string): number | null {
    if (!duration) return null
    const dayMatch = duration.match(/(\d+)\s*D/i)
    if (dayMatch) return Number(dayMatch[1])
    const nightMatch = duration.match(/(\d+)\s*N/i)
    if (nightMatch) return Number(nightMatch[1]) + 1
    const bare = duration.match(/(\d+)/)
    return bare ? Number(bare[1]) : null
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const destination = await getDestinationBySlug(slug)
    if (!destination) return { title: "Destination not found | Travplan" }

    const label = destination.city || destination.name.replace(/,.*$/, "")
    const seo = getDestinationSeo(label)
    const canonical = `${SITE_URL}/destinations/${destination.slug}`
    const packages = await getDestinationPackages(destination.id)
    const guide = getDestinationGuide(destination.slug)

    return {
        // absolute: getDestinationSeo already ends in "| Travplan", and the
        // root layout's template would otherwise append it a second time.
        title: { absolute: seo.title },
        description: seo.description,
        alternates: { canonical },
        // Indexable once the page has something worth indexing. A written
        // guide is several hundred words of unique content, which is enough on
        // its own even with no packages yet — those pages sell a custom
        // itinerary. A destination with neither stays out of the index.
        robots:
            guide || packages.length > 0
                ? { index: true, follow: true }
                : { index: false, follow: true },
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: canonical,
            type: "website",
            images: destination.image ? [{ url: destination.image }] : undefined,
        },
    }
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const destination = await getDestinationBySlug(slug)
    if (!destination) notFound()

    const label = destination.city || destination.name.replace(/,.*$/, "")
    const guide = getDestinationGuide(destination.slug)

    const [packages, blogs, siblings] = await Promise.all([
        getDestinationPackages(destination.id),
        getDestinationBlogs(destination.id),
        getSiblingDestinations(destination),
    ])

    // The hero's figures used to be computed in the browser from a second
    // fetch. They are derived here instead, so they are in the HTML.
    const listedPrices = packages.map((p) => p.price).filter((n) => !isPriceOnRequest(n))
    const days = packages
        .map((p) => parseDays(p.duration))
        .filter((n): n is number => typeof n === "number" && n > 0)
    const rated = packages.filter((p) => p.rating > 0)
    const reviewTotal = packages.reduce((sum, p) => sum + p.reviewCount, 0)

    const fromPrice = listedPrices.length ? Math.min(...listedPrices) : undefined
    const country = destination.country || undefined
    const canonical = `${SITE_URL}/destinations/${destination.slug}`

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                    { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE_URL}/destinations` },
                    { "@type": "ListItem", position: 3, name: label, item: canonical },
                ],
            },
            ...(guide
                ? [
                      {
                          "@type": "FAQPage",
                          "@id": `${canonical}#faq`,
                          mainEntity: guide.faqs.map((f) => ({
                              "@type": "Question",
                              name: f.q,
                              acceptedAnswer: { "@type": "Answer", text: f.a },
                          })),
                      },
                  ]
                : []),
            ...(packages.length
                ? [
                      {
                          "@type": "ItemList",
                          "@id": `${canonical}#trips`,
                          name: `${label} tour packages`,
                          numberOfItems: packages.length,
                          itemListElement: packages.map((p, i) => ({
                              "@type": "ListItem",
                              position: i + 1,
                              name: p.title,
                              url: `${SITE_URL}/destinations/trip/${p.id}`,
                          })),
                      },
                  ]
                : []),
        ],
    }

    return (
        <main className="w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ------------------------------- the page as it was, unchanged */}
            <DestinationHero
                city={destination.city || undefined}
                title={destination.name}
                subhead="Tours & Trips"
                description={destination.description || undefined}
                country={country}
                region={destination.region || undefined}
                image={destination.image || undefined}
                tripCount={packages.length || undefined}
                fromPrice={fromPrice}
                dayRange={days.length ? { min: Math.min(...days), max: Math.max(...days) } : undefined}
                rating={rated.length ? rated.reduce((s, p) => s + p.rating, 0) / rated.length : undefined}
                reviewCount={reviewTotal || undefined}
            />

            <DestinationTrips destinationId={destination.id} destinationName={label} />

            <DestinationInterests destinationId={destination.id} destinationName={label} />

            <DestinationPlan destinationName={label} country={country} destinationId={destination.id} />

            {/* ------------------------------- SEO content, appended below it */}
            {guide && (
                <>
                    <DestinationIntro
                        name={label}
                        guide={guide}
                        tripCount={packages.length}
                        fromPrice={fromPrice ?? null}
                    />
                    <BestTimeToVisit name={label} paragraphs={guide.bestTime} />
                    <ThingsToDo name={label} items={guide.thingsToDo} />
                    <DaysNeeded name={label} text={guide.daysNeeded} />
                </>
            )}

            <DestinationBlogs name={label} blogs={blogs} />

            {guide ? (
                <DestinationGuideFaqs name={label} faqs={guide.faqs} />
            ) : (
                <FAQ destination={label || country} variant="featured" />
            )}

            <SiblingDestinations country={destination.country} siblings={siblings} />
        </main>
    )
}
