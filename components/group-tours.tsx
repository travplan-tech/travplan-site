"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGetPackagesQuery } from "@/lib/api/packagesApi"

const sectionConfig = [
  {
    id: 1,
    title: "Domestic Group Tours",
    subtitle: "Explore India's hidden gems",
    tripType: "domestic",
    defaultImage: "https://images.unsplash.com/photo-1764014588235-d339ae275f19?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDM1fGJvOGpRS1RhRTBZfHxlbnwwfHx8fHw%3D",
    durationRanges: [
      { label: "Short weekend trips (2-3 Days)", duration: "1-3" },
      { label: "Long weekend trips (4-7 Days)", duration: "4-7" },
    ]
  },
  {
    id: 2,
    title: "International Group Trips",
    subtitle: "Discover the world affordably",
    tripType: "international",
    defaultImage: "https://images.unsplash.com/photo-1764071289023-227898d0d827?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE3fGJvOGpRS1RhRTBZfHxlbnwwfHx8fHw%3D",
    durationRanges: [
      { label: "Short Trips (2-4 Days)", duration: "1-3" },
      { label: "Long Vacations (5+ Days)", duration: "4-7" },
    ]
  },
]

export default function GroupTours() {
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

  // RTK Query hooks for domestic and international group tours - only fetch when in view
  const { data: domesticData, isLoading: domesticLoading } = useGetPackagesQuery({
    tourCategory: "GROUP",
    country: "India",
    limit: 1,
    sortBy: "popular"
  }, { skip: !isInView })

  const { data: internationalData, isLoading: internationalLoading } = useGetPackagesQuery({
    tourCategory: "GROUP",
    excludeCountry: "India",
    limit: 1,
    sortBy: "popular"
  }, { skip: !isInView })

  const loading = domesticLoading || internationalLoading

  // Process data from RTK Query
  const stats = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domData = domesticData as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intData = internationalData as any

    return {
      domestic: {
        count: domData?.pagination?.total || domData?.length || 0,
        image: domData?.packages?.[0]?.image || domData?.packages?.[0]?.destination?.image || domData?.[0]?.image
      },
      international: {
        count: intData?.pagination?.total || intData?.length || 0,
        image: intData?.packages?.[0]?.image || intData?.packages?.[0]?.destination?.image || intData?.[0]?.image
      }
    }
  }, [domesticData, internationalData])

  return (
    <section ref={sectionRef} className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Group Tours</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              Explore our carefully curated selection of budget-friendly tours, designed to offer you the best value for money while ensuring a memorable and enriching experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {sectionConfig.map((section) => {
            const data = section.tripType === "domestic" ? stats.domestic : stats.international
            const params = section.tripType === "domestic" ? "country=India" : "excludeCountry=India"
            const imageSrc = data.image || section.defaultImage

            return (
              <div key={section.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Image Header */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={section.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg">{section.title}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      {section.subtitle} • {loading ? "..." : data.count} Tours
                    </p>
                  </div>
                </div>

                {/* Duration Filtering Buttons */}
                <div className="p-4 md:p-5">
                  <p className="text-sm font-medium text-gray-600 mb-3">Choose trip duration:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {section.durationRanges.map((range) => (
                      <Link
                        key={range.duration}
                        href={`/destinations?tourCategory=GROUP&${params}&duration=${range.duration}`}
                        className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm md:text-base font-semibold text-blue-700 hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-500"
                      >
                        {range.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
