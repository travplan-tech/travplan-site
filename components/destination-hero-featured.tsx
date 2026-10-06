"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Clock, IndianRupee, MapPin, Star, Ticket } from "lucide-react"

/**
 * Hero for the featured destination pages (see FEATURED_DESTINATION_IDS in
 * app/destinations/trip/page.tsx). Other destinations still render the shared
 * `destination-hero`, so this can change without affecting the rest of the site.
 */
interface DestinationHeroFeaturedProps {
    country?: string | null
    region?: string | null
    city?: string | null
    title?: string
    subhead?: string
    description?: string
    image?: string
    tripCount?: number
    fromPrice?: number
    dayRange?: { min: number; max: number }
    /** Average rating across this destination's packages, 0 when unrated */
    rating?: number
    /** Number of reviews behind that average */
    reviewCount?: number
}

export default function DestinationHeroFeatured({
    country,
    region,
    city,
    title,
    subhead,
    description,
    image,
    tripCount,
    fromPrice,
    dayRange,
    rating,
    reviewCount,
}: DestinationHeroFeaturedProps) {
    // Names arrive as "Tawang, India" or "Kerala , India" — show just the place.
    const place = (city || title || country || region || "Explore")
        .trim()
        .replace(/\s*,\s*$/, "")

    const subtitle =
        description ||
        (country
            ? `Browse our curated collection of trips across ${country}, each one planned with local operators and flexible departures.`
            : "Discover handpicked trips, planned with local operators and flexible departures.")

    const bgImage = image || "/mountain-lake-landscape.jpg"

    const stats = [
        tripCount
            ? {
                icon: Ticket,
                value: String(tripCount),
                label: tripCount === 1 ? "trip available" : "trips available",
            }
            : null,
        fromPrice
            ? {
                icon: IndianRupee,
                value: `₹${fromPrice.toLocaleString("en-IN")}`,
                label: "lowest price, per person",
            }
            : null,
        dayRange
            ? {
                icon: Clock,
                value:
                    dayRange.min === dayRange.max
                        ? `${dayRange.min} days`
                        : `${dayRange.min}–${dayRange.max} days`,
                label: "trip lengths",
            }
            : null,
    ].filter(Boolean) as { icon: typeof Ticket; value: string; label: string }[]

    // Only shown when real reviews exist; nothing is invented here.
    const hasRating = typeof rating === "number" && rating > 0

    return (
        <section className="w-full bg-white">
            {/* Image band */}
            <div className="relative w-full h-72 sm:h-80 md:h-96 bg-gray-900">
                <Image
                    src={bgImage}
                    alt={`${place}, ${country || "travel destination"}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
                    aria-hidden="true"
                />

                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 md:pb-24">
                    <nav aria-label="Breadcrumb" className="mb-auto pt-6">
                        <ol className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <ChevronRight size={14} className="text-white/40 shrink-0" aria-hidden="true" />
                            <li>
                                <Link href="/destinations" className="hover:text-white transition-colors">
                                    Destinations
                                </Link>
                            </li>
                            {country && (
                                <>
                                    <ChevronRight size={14} className="text-white/40 shrink-0" aria-hidden="true" />
                                    <li>
                                        <Link
                                            href={`/destinations?country=${encodeURIComponent(country)}`}
                                            className="hover:text-white transition-colors"
                                        >
                                            {country}
                                        </Link>
                                    </li>
                                </>
                            )}
                            <ChevronRight size={14} className="text-white/40 shrink-0" aria-hidden="true" />
                            <li className="text-white font-medium" aria-current="page">
                                {place}
                            </li>
                        </ol>
                    </nav>

                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        {(country || region) && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
                                <MapPin size={12} aria-hidden="true" />
                                {[country, region].filter(Boolean).join(" · ")}
                            </span>
                        )}
                        {hasRating && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                                {rating!.toFixed(1)}
                                {reviewCount ? (
                                    <span className="text-white/70 font-normal">({reviewCount} reviews)</span>
                                ) : null}
                            </span>
                        )}
                    </div>

                    <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] drop-shadow-lg">
                        {place}
                        {subhead && (
                            <span className="text-white/60 font-normal text-xl sm:text-2xl md:text-3xl ml-3">
                                {subhead}
                            </span>
                        )}
                    </h1>
                </div>
            </div>

            {/* Card overlapping the image, carrying the facts and the actions */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-12 md:-mt-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl">
                        {subtitle}
                    </p>

                    {stats.length > 0 && (
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8 mt-6 pt-6 border-t border-gray-100">
                            {stats.map((stat) => {
                                const Icon = stat.icon
                                return (
                                    <div key={stat.label} className="flex items-center gap-3">
                                        <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Icon size={18} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <dd className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                                                {stat.value}
                                            </dd>
                                            <dt className="text-xs md:text-sm text-gray-500">{stat.label}</dt>
                                        </div>
                                    </div>
                                )
                            })}
                        </dl>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
                        <Link
                            href="#best-tours"
                            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            See all trips
                            <ChevronRight size={18} aria-hidden="true" />
                        </Link>
                        <Link
                            href="#customize-trip"
                            className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            Talk to a travel advisor
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
