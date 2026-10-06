"use client"
import { Suspense, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import DestinationHero from "@/components/destination-hero-featured"
import { useGetDestinationQuery } from "@/lib/api/destinationsApi"
import { useGetPackagesByDestinationQuery } from "@/lib/api/packagesApi"
import {
    CarouselSkeleton,
    TourTypesSkeleton,
    CustomizeTripSkeleton,
} from "@/components/loading-skeletons"

// Dynamic imports for below-the-fold components
const DestinationTrips = dynamic(() => import("@/components/destination-trips"), {
    loading: () => <CarouselSkeleton items={3} />,
})
const DestinationInterests = dynamic(() => import("@/components/destination-interests"), {
    loading: () => <TourTypesSkeleton />,
})
const DestinationPlan = dynamic(() => import("@/components/destination-plan"), {
    loading: () => <CustomizeTripSkeleton />,
})
const FAQ = dynamic(() => import("@/components/faq"), {
    loading: () => <FAQSkeleton />,
})

function FAQSkeleton() {
    return (
        <section className="py-12 md:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8 mx-auto" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                            <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/** Matches the hero's shape so the layout does not jump while data loads. */
function HeroSkeleton() {
    return (
        <section className="w-full bg-white pt-4 pb-8 md:pt-6 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-4 md:mb-6" />
            </div>
            <div className="w-full bg-gray-200 animate-pulse">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16">
                    <div className="max-w-xl space-y-4">
                        <div className="h-3 w-28 bg-gray-300/70 rounded" />
                        <div className="h-10 md:h-14 w-2/3 bg-gray-300/70 rounded" />
                        <div className="h-6 w-40 bg-gray-300/70 rounded" />
                        <div className="h-4 w-full bg-gray-300/70 rounded" />
                        <div className="h-4 w-4/6 bg-gray-300/70 rounded" />
                        <div className="flex gap-8 pt-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-7 w-20 bg-gray-300/70 rounded" />
                                    <div className="h-3 w-14 bg-gray-300/70 rounded" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-3">
                            <div className="h-12 w-36 bg-gray-300/70 rounded-xl" />
                            <div className="h-12 w-48 bg-gray-300/70 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
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

function DestinationContent() {
    const searchParams = useSearchParams()
    const destinationId = searchParams.get("destination")
    const numericId = destinationId ? Number(destinationId) : undefined

    const { data: destination, isLoading } = useGetDestinationQuery(Number(destinationId), {
        skip: !destinationId,
    })

    // Packages power the hero's figures: trip count, lowest price, trip lengths.
    const { data: packages } = useGetPackagesByDestinationQuery(numericId as number, {
        skip: !numericId,
    })

    const stats = useMemo(() => {
        const list = Array.isArray(packages) ? packages : []
        if (list.length === 0) {
            return {
                tripCount: undefined,
                fromPrice: undefined,
                dayRange: undefined,
                rating: undefined,
                reviewCount: undefined,
            }
        }

        const prices = list.map((p) => p.price).filter((n): n is number => typeof n === "number" && n > 0)
        const days = list
            .map((p) => parseDays(p.duration))
            .filter((n): n is number => typeof n === "number" && n > 0)

        // Ratings are shown only where real reviews exist; nothing is invented.
        const rated = list.filter((p) => typeof p.rating === "number" && p.rating > 0)
        const reviewTotal = list.reduce((sum, p) => sum + (p.reviewCount || 0), 0)

        return {
            tripCount: list.length,
            fromPrice: prices.length ? Math.min(...prices) : undefined,
            dayRange: days.length ? { min: Math.min(...days), max: Math.max(...days) } : undefined,
            rating: rated.length
                ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length
                : undefined,
            reviewCount: reviewTotal || undefined,
        }
    }, [packages])

    const country = destination?.country || undefined

    return (
        <main className="w-full">
            {isLoading ? (
                <HeroSkeleton />
            ) : (
                <DestinationHero
                    city={destination?.city || undefined}
                    title={destination?.name || "Destination"}
                    subhead="Tours & Trips"
                    description={destination?.description || undefined}
                    country={country}
                    region={destination?.region || undefined}
                    image={destination?.image || undefined}
                    tripCount={stats.tripCount}
                    fromPrice={stats.fromPrice}
                    dayRange={stats.dayRange}
                    rating={stats.rating}
                    reviewCount={stats.reviewCount}
                />
            )}

            <DestinationTrips
                destinationId={numericId}
                destinationName={destination?.city || undefined}
            />

            <DestinationInterests
                destinationId={numericId}
                destinationName={destination?.city || undefined}
            />

            <DestinationPlan destinationName={destination?.city || undefined} country={country} />

            <FAQ destination={destination?.city || country} variant="featured" />
        </main>
    )
}

export default function DestinationTripPage() {
    return (
        <Suspense fallback={<HeroSkeleton />}>
            <DestinationContent />
        </Suspense>
    )
}
