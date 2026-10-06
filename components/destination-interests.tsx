"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useGetTourTypeStatsQuery } from "@/lib/api/packagesApi"
import SectionHeading from "@/components/section-heading"

const TOUR_TYPES = [
    { type: "Family", image: "/family.jpeg", description: "Fun for the whole family" },
    { type: "Couples", image: "/couple.jpeg", description: "Romantic getaways for two" },
    {
        type: "Friends",
        image:
            "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&auto=format&fit=crop&q=60",
        description: "Adventure with your squad",
    },
    { type: "Adventure", image: "/adventure.jpeg", description: "Thrilling experiences await" },
    {
        type: "Cultural & Architecture",
        image:
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=60",
        description: "Explore heritage and history",
    },
    { type: "Pilgrim Tours", image: "/pilgrim.jpeg", description: "Meet new travel companions" },
    { type: "Luxury", image: "/luxury.jpeg", description: "Relax, rejuvenate, refresh" },
    {
        type: "Instagrammable",
        image: "/Instagrammable.jpeg",
        description: "Picture-perfect destinations",
    },
]

export default function DestinationInterests({
    destinationId,
    destinationName,
}: {
    destinationId?: number
    destinationName?: string | null
}) {
    const { data, isLoading } = useGetTourTypeStatsQuery(
        { destinationId: destinationId || undefined },
        { skip: !destinationId }
    )

    const stats = (data || {}) as Record<string, number>
    const place = destinationName?.trim().replace(/\s*,\s*$/, "")

    // Only show styles this destination actually has trips for, so the grid
    // never advertises "0 Tours".
    const available = TOUR_TYPES.map((t) => ({ ...t, tours: stats[t.type] || 0 })).filter(
        (t) => t.tours > 0
    )

    if (!isLoading && available.length === 0) return null

    return (
        <section id="trip-types" className="scroll-mt-24 py-14 md:py-20 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Travel style"
                    title={place ? `What kind of ${place} trip?` : "What kind of trip?"}
                    subtitle="Pick the style that fits you — we will show only the trips that match."
                />

                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-4/3 rounded-2xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {available.map((item) => (
                            <Link
                                key={item.type}
                                href={`/destinations?tourType=${encodeURIComponent(item.type)}${destinationId ? `&destinationId=${destinationId}` : ""
                                    }`}
                                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-900"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.type}
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
                                    aria-hidden="true"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                                    <h3 className="text-white font-bold text-base md:text-lg leading-tight drop-shadow">
                                        {item.type}
                                    </h3>
                                    <p className="text-white/75 text-xs mt-1 line-clamp-1">{item.description}</p>
                                    <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold mt-3 bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-1 rounded-full">
                                        {item.tours} {item.tours === 1 ? "trip" : "trips"}
                                        <ArrowRight
                                            size={12}
                                            className="group-hover:translate-x-0.5 transition-transform"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
