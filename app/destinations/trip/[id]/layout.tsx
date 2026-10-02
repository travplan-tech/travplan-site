import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

/**
 * Package titles are stored in a compact admin format such as "Kashmir-4N/5D".
 * That reads badly as a search result, so expand it into a natural title.
 * Titles that are already descriptive ("Ladakh Bike Expedition") are left alone.
 */
function readableTitle(raw: string, duration?: string | null): string {
    const title = raw.trim()

    // "Kashmir-4N/5D" / "Kerala 7N/8D" -> "Kashmir Tour Package 4N/5D"
    const compact = title.match(/^(.+?)[\s-]*(\d+\s*N\s*\/\s*\d+\s*D)$/i)
    if (compact) {
        const place = compact[1].replace(/[-\s]+$/, "").trim()
        const nights = compact[2].replace(/\s+/g, "").toUpperCase()
        return `${place} Tour Package ${nights}`
    }

    // Already descriptive: append the duration only when it is not implied.
    if (duration && !/\d+\s*N/i.test(title)) {
        return `${title} ${duration.replace(/\s+/g, "")}`
    }
    return title
}

/** Turns "4N/5D" into "4 nights, 5 days" for description copy. */
function spelledDuration(duration?: string | null): string | null {
    if (!duration) return null
    const m = duration.match(/(\d+)\s*N\s*\/\s*(\d+)\s*D/i)
    if (!m) return null
    return `${m[1]} nights, ${m[2]} days`
}

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    try {
        const tour = await prisma.package.findUnique({
            where: { id },
            select: {
                title: true,
                description: true,
                image: true,
                price: true,
                duration: true,
                tourType: true,
                destination: {
                    select: {
                        name: true,
                        country: true,
                    },
                },
            },
        })

        if (!tour) {
            return {
                title: "Tour Not Found",
                description: "The requested tour package could not be found.",
            }
        }

        const country = tour.destination?.country || ""
        const destination = tour.destination?.name || ""

        const niceTitle = readableTitle(tour.title, tour.duration)
        const spelled = spelledDuration(tour.duration)
        // Keep the whole title inside Google's display width where possible.
        const fullTitle =
            `${niceTitle} | Book with Travplan`.length <= 60
                ? `${niceTitle} | Book with Travplan`
                : `${niceTitle} | Travplan`
        const fallbackDescription = spelled
            ? `Book a ${spelled} ${destination || country} tour package with Travplan. Check itinerary highlights, stays, inclusions and enquiry options.`
            : `Book ${niceTitle} with Travplan. Check itinerary highlights, stays, inclusions and enquiry options.`
        // Long editorial descriptions get truncated in results, so prefer the
        // concise generated line when the stored copy will not fit.
        const description =
            tour.description && tour.description.length <= 160
                ? tour.description
                : fallbackDescription

        return {
            title: { absolute: fullTitle },
            description,
            keywords: [
                niceTitle,
                destination,
                country,
                tour.tourType || "tour",
                "travel package",
                "vacation",
                "tour booking",
                `${country} tours`,
                `${tour.duration} trip`,
            ].filter(Boolean),
            alternates: {
                canonical: `/destinations/trip/${id}`,
            },
            openGraph: {
                title: fullTitle,
                description,
                url: `/destinations/trip/${id}`,
                type: "website",
                images: tour.image
                    ? [
                        {
                            url: tour.image,
                            width: 1200,
                            height: 630,
                            alt: tour.title,
                        },
                    ]
                    : undefined,
            },
            twitter: {
                card: "summary_large_image",
                title: fullTitle,
                description,
                images: tour.image ? [tour.image] : undefined,
            },
        }
    } catch {
        return {
            title: "Tour Package",
            description: "Explore amazing tour packages with Travplan.",
        }
    }
}

export default function TourDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
