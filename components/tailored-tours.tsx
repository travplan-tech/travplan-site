"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useGetTourTypeStatsQuery } from "@/lib/api/packagesApi"

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
    image: "/family.jpeg",
    description: "Fun for the whole family"
  },
  {
    id: 2,
    type: "Couples",
    tours: 0,
    image: "/couple.jpeg",
    description: "Romantic getaways for two"
  },
  {
    id: 3,
    type: "Friends",
    tours: 0,
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&auto=format&fit=crop&q=60",
    description: "Adventure with your squad"
  },
  {
    id: 4,
    type: "Adventure",
    tours: 0,
    image: "/adventure.jpeg",
    description: "Thrilling experiences await"
  },
  {
    id: 5,
    type: "Cultural & Architecture",
    tours: 0,
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=60",
    description: "Explore heritage and history"
  },
  {
    id: 6,
    type: "Pilgrim Tours",
    tours: 0,
    image: "/pilgrim.jpeg",
    description: "Meet new travel companions"
  },
  {
    id: 7,
    type: "Luxury",
    tours: 0,
    image: "/luxury.jpeg",
    description: "Relax, rejuvenate, refresh"
  },
  {
    id: 8,
    type: "Instagrammable",
    tours: 0,
    image: "/Instagrammable.jpeg",
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
}

export default function TailoredTours({ country, region, saleSlug, tourCategory, excludeCountry, destinationId }: TailoredToursProps = {}) {
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
  const { data: statsData, isLoading: loading } = useGetTourTypeStatsQuery(queryParams, {
    skip: !isInView
  })

  // Merge API stats with default tour types
  const tourTypes = useMemo(() => {
    if (!statsData) return defaultTourTypes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = statsData as any
    return defaultTourTypes.map(type => ({
      ...type,
      tours: stats[type.type] || 0
    }))
  }, [statsData])

  return (
    <section ref={sectionRef} className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Tours as per <span className="text-primary">interest</span>
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              Discover tours tailored to your travel style - from private experiences to group adventures.
            </p>
          </div>
        </div>

        {(loading || !isInView) ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {tourTypes.map((type) => {
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
                  className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square">
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
