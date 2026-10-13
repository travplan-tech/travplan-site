"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useGetTourTypeStatsQuery } from "@/lib/api/packagesApi"
import SectionHeading from "@/components/section-heading"

interface TourType {
  id: number
  type: string
  tours: number
  image: string
  description: string
}

const defaultTourTypes: TourType[] = [
  {
    id: 1,
    type: "Family",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880434/TravPlan/site/family.jpg",
    description: "Fun for the whole family"
  },
  {
    id: 2,
    type: "Couples",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880430/TravPlan/site/couple.jpg",
    description: "Romantic getaways for two"
  },
  {
    id: 3,
    type: "Friends",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_600,c_limit/v1791880467/TravPlan/stock/unsplash-1539635278303-d4002c07eae3.jpg",
    description: "Adventure with your squad"
  },
  {
    id: 4,
    type: "Adventure",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880426/TravPlan/site/adventure.jpg",
    description: "Thrilling experiences await"
  },
  {
    id: 5,
    type: "Cultural & Architecture",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_600,c_limit/v1791880468/TravPlan/stock/unsplash-1548013146-72479768bada.jpg",
    description: "Explore heritage and history"
  },
  {
    id: 6,
    type: "Pilgrim Tours",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880450/TravPlan/site/pilgrim.jpg",
    description: "Meet new travel companions"
  },
  {
    id: 7,
    type: "Luxury",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880443/TravPlan/site/luxury.jpg",
    description: "Relax, rejuvenate, refresh"
  },
  {
    id: 8,
    type: "Instagrammable",
    tours: 0,
    image: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880424/TravPlan/site/instagrammable.jpg",
    description: "Picture-perfect destinations"
  },
]

interface TailoredToursProps {
  country?: string | null
  region?: string | null
  saleSlug?: string | null
  tourCategory?: string | null
  excludeCountry?: string | null
  destinationId?: number
  /** Server-rendered tour-type counts, keyed by tour type. */
  initialStats?: Record<string, number>
}

export default function TailoredTours({ country, region, saleSlug, tourCategory, excludeCountry, destinationId, initialStats }: TailoredToursProps = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  // IntersectionObserver to detect when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Build query params - include all filters so counts are accurate for the context
  const queryParams = useMemo(() => ({
    destinationId: destinationId || undefined,
    country: country || undefined,
    region: region || undefined,
    saleSlug: saleSlug || undefined,
    tourCategory: tourCategory || undefined,
    excludeCountry: excludeCountry || undefined,
  }), [destinationId, country, region, saleSlug, tourCategory, excludeCountry])

  // RTK Query hook - only fetch when in view
  const { data: fetchedStats, isLoading: fetching } = useGetTourTypeStatsQuery(queryParams, {
    skip: !isInView || !!initialStats
  })
  // Server-rendered counts arrive as a prop, so there is nothing to wait for.
  const statsData = initialStats ?? fetchedStats
  const loading = initialStats ? false : fetching

  // Merge API stats with default tour types
  const tourTypes = useMemo(() => {
    if (!statsData) return defaultTourTypes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = statsData as any
    return defaultTourTypes
      .map(type => ({ ...type, tours: stats[type.type] || 0 }))
      .filter(type => type.tours > 0)
  }, [statsData])

  return (
    <section ref={sectionRef} className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Interests"
          title="Travel the way you like"
          subtitle="Family holidays, couple escapes, pilgrimages or adventure — browse by what you are after."
        />

        {(loading || !isInView) ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-flow-dense grid-cols-2 lg:grid-cols-4 auto-rows-[170px] md:auto-rows-[200px] gap-3 md:gap-4">
            {tourTypes.map((type, index) => {
              // 0 and 5 run tall, 3 runs wide — gives the grid a bento rhythm
              const span =
                index === 0 || index === 5
                  ? "row-span-2"
                  : index === 3
                    ? "lg:col-span-2"
                    : ""

              const href = `/destinations?tourType=${encodeURIComponent(type.type)}` +
                (destinationId ? `&destinationId=${destinationId}` : "") +
                (country ? `&country=${encodeURIComponent(country)}` : "") +
                (region ? `&region=${encodeURIComponent(region)}` : "") +
                (saleSlug ? `&saleSlug=${encodeURIComponent(saleSlug)}` : "") +
                (tourCategory ? `&tourCategory=${encodeURIComponent(tourCategory)}` : "") +
                (excludeCountry ? `&excludeCountry=${encodeURIComponent(excludeCountry)}` : "");

              return (
                <Link
                  key={type.id}
                  href={href}
                  className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 ${span}`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={type.image || "/placeholder.svg"}
                      alt={type.type}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 leading-tight">{type.type}</h3>
                      <p className="text-xs md:text-sm opacity-80 mb-2 hidden md:block">{type.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {type.tours} Tours
                        </span>
                        <span className="text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
