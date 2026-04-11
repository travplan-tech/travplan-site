"use client"
import { Suspense, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import DestinationHero from "@/components/destination-hero"
import { useGetDestinationQuery } from "@/lib/api/destinationsApi"
import {
    CarouselSkeleton,
    TourTypesSkeleton,
    CustomizeTripSkeleton,
} from "@/components/loading-skeletons"

// Dynamic imports for below-the-fold components
const BestTours = dynamic(() => import("@/components/best-tours"), {
    loading: () => <CarouselSkeleton items={3} />,
})
const TailoredTours = dynamic(() => import("@/components/tailored-tours"), {
    loading: () => <TourTypesSkeleton />,
})
const CustomizeTrip = dynamic(() => import("@/components/customize-trip"), {
    loading: () => <CustomizeTripSkeleton />,
})
const FAQ = dynamic(() => import("@/components/faq"), {
    loading: () => <FAQSkeleton />,
})
const TravelersPhotos = dynamic(() => import("@/components/travelers-photos"), {
    loading: () => <GallerySmallSkeleton />,
})

// Skeleton for FAQ
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

// Skeleton for photos gallery
function GallerySmallSkeleton() {
    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                    ))}
                </div>
            </div>
        </section>
    )
}

function DestinationContent() {
    const searchParams = useSearchParams()
    const destinationId = searchParams.get("destination")

    // Fetch destination details by ID
    const { data: destination, isLoading } = useGetDestinationQuery(
        Number(destinationId),
        {
            skip: !destinationId,
        }
    )

    // Extract destination data for hero and filtering
    const country = destination?.country || undefined

    return (
        <main className="w-full">
            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    <DestinationHero
                        title={`${destination?.name || 'Destination'} Tours & Trips`}
                        description={destination?.description || undefined}
                        country={country}
                        image={destination?.image || undefined}
                    />
                    <BestTours
                        destinationId={destinationId ? Number(destinationId) : undefined}
                    />
                    <TailoredTours
                        destinationId={destinationId ? Number(destinationId) : undefined}
                    />
                    <CustomizeTrip />
                    <FAQ />
                    <TravelersPhotos />
                </>
            )}
        </main>
    )
}

export default function DestinationTripPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <DestinationContent />
        </Suspense>
    )
}
