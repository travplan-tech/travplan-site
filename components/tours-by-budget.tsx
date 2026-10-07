"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGetBudgetStatsQuery } from "@/lib/api/packagesApi"
import SectionHeading from "@/components/section-heading"

interface BudgetSection {
  id: number
  image: string
  title: string
  subtitle: string
  tours: number
  budgetType: "domestic" | "international"
  budgetRanges: Array<{ label: string; maxPrice: number; count: number }>
}

const defaultSections: BudgetSection[] = [
  {
    id: 1,
    image: "/domestic.jpg",
    title: "Domestic Tours",
    subtitle: "Explore India's hidden gems",
    tours: 0,
    budgetType: "domestic",
    budgetRanges: [
      { label: "Under ₹10,000", maxPrice: 10000, count: 0 },
      { label: "Under ₹20,000", maxPrice: 20000, count: 0 },
      { label: "Under ₹30,000", maxPrice: 30000, count: 0 },
      { label: "Under ₹50,000", maxPrice: 50000, count: 0 },
    ]
  },
  {
    id: 2,
    image: "/international.jpeg",
    title: "International Tours",
    subtitle: "Discover the world affordably",
    tours: 0,
    budgetType: "international",
    budgetRanges: [
      { label: "Under ₹30,000", maxPrice: 30000, count: 0 },
      { label: "Under ₹50,000", maxPrice: 50000, count: 0 },
      { label: "Under ₹75,000", maxPrice: 75000, count: 0 },
      { label: "Under ₹1,00,000", maxPrice: 100000, count: 0 },
    ]
  },
]

export default function ToursByBudget() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  // IntersectionObserver to detect when section enters viewport
  useEffect(() => {
    // Wait for next frame to ensure layout is settled
    const rafId = requestAnimationFrame(() => {
      const element = sectionRef.current
      if (!element) return

      // Check if element is below the fold (not initially visible)
      const rect = element.getBoundingClientRect()
      const isBelowFold = rect.top >= window.innerHeight

      if (!isBelowFold) {
        // Element is in view, fetch immediately
        setIsInView(true)
        return
      }

      // Set up observer for when user scrolls to it
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        { rootMargin: '100px' }
      )

      observer.observe(element)
    })

    return () => cancelAnimationFrame(rafId)
  }, [])

  // RTK Query hook - only fetch when in view
  const { data: budgetData, isLoading: loading } = useGetBudgetStatsQuery(undefined, {
    skip: !isInView
  })

  // Merge API data with default sections
  const sections = defaultSections.map(section => {
    const data = budgetData as any
    const sectionData = data?.[section.budgetType]
    if (sectionData) {
      return {
        ...section,
        tours: sectionData.totalTours || 0,
        budgetRanges: section.budgetRanges.map(range => ({
          ...range,
          count: sectionData.budgetCounts?.[range.maxPrice] || 0
        }))
      }
    }
    return section
  })

  return (
    <section ref={sectionRef} className="py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Budget"
          title="Trips that fit what you want to spend"
          subtitle="Pick a price range and see everything we run within it — no hidden add-ons."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {sections.map((section) => (
            <div key={section.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              {/* Image Header */}
              <div className="relative h-32 md:h-44 overflow-hidden">
                <Image
                  src={section.image || "/placeholder.svg"}
                  alt={section.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg">{section.title}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {section.subtitle} • {loading ? "..." : section.tours} Tours
                  </p>
                </div>
              </div>

              {/* Budget Buttons */}
              <div className="p-4 md:p-5">
                <div className="grid grid-cols-2 gap-3">
                  {section?.budgetRanges?.map((range) => (
                    <Link
                      key={range.maxPrice}
                      href={`/tours?type=${section.budgetType}&maxPrice=${range.maxPrice}`}
                      className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <p className="text-center">{range.label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
