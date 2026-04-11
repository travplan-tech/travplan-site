"use client"
import { Suspense, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import DestinationHero from "@/components/destination-hero"
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"
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
  const country = searchParams.get("country")
  const region = searchParams.get("region")
  const tourCategory = searchParams.get("tourCategory")
  const excludeCountry = searchParams.get("excludeCountry")
  const tourType = searchParams.get("tourType")

  // Build query params for destinations API
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (country) params.country = country
    if (region) params.region = region
    return params
  }, [country, region])

  // RTK Query hook for fetching destinations
  const { data: destinationsData } = useGetDestinationsQuery(queryParams, {
    skip: !country && !region
  })

  // Extract destination image from the first result
  const destinationImage = useMemo(() => {
    if (Array.isArray(destinationsData) && destinationsData.length > 0) {
      return (destinationsData[0] as { image?: string }).image
    }
    return undefined
  }, [destinationsData])

  return (
    <main className="w-full">
      <DestinationHero country={country} region={region} image={destinationImage} />
      <BestTours
        country={country}
        region={region}
        tourCategory={tourCategory}
        excludeCountry={excludeCountry}
        tourType={tourType}
      />
      <TailoredTours country={country} region={region} tourCategory={tourCategory} excludeCountry={excludeCountry} />
      <CustomizeTrip />
      <FAQ />
      <TravelersPhotos />
    </main>
  )
}

export default function DestinationPage() {
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
