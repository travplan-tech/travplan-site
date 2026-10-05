"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight, MapPin } from "lucide-react"

/**
 * Editorial hero used only on the featured destination pages (see
 * FEATURED_DESTINATION_IDS in app/destinations/trip/page.tsx). Every other
 * destination still renders the shared `destination-hero` component, so this
 * can be iterated on without affecting the rest of the site.
 */
interface DestinationHeroFeaturedProps {
    country?: string | null
    region?: string | null
    /** City/state within the country, e.g. "Tawang" from "Tawang, India" */
    city?: string | null
    title?: string
    /** Small line under the headline, e.g. "Tours & Trips" */
    subhead?: string
    description?: string
    image?: string
    /** Number of packages available for this destination */
    tripCount?: number
    /** Lowest package price, in INR */
    fromPrice?: number
    /** Shortest and longest trip length in days */
    dayRange?: { min: number; max: number }
}

const TRUST_POINTS = [
    "Best Price Guarantee",
    "Verified Customer Reviews",
    "Wide Selection of Tours",
]

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
            ? { label: tripCount === 1 ? "trip available" : "trips available", value: String(tripCount) }
            : null,
        fromPrice ? { label: "per person", value: `from ₹${fromPrice.toLocaleString("en-IN")}` } : null,
        dayRange
            ? {
                label: "days",
                value:
                    dayRange.min === dayRange.max
                        ? String(dayRange.min)
                        : `${dayRange.min}–${dayRange.max}`,
            }
            : null,
    ].filter(Boolean) as { label: string; value: string }[]

    return (
        <section className="w-full bg-white pt-4 pb-10 md:pt-6 md:pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
                    <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                        <li>
                            <Link href="/" className="hover:text-primary transition-colors">
                                Home
                            </Link>
                        </li>
                        <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                        <li>
                            <Link href="/destinations" className="hover:text-primary transition-colors">
                                Destinations
                            </Link>
                        </li>
                        {country && (
                            <>
                                <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                                <li>
                                    <Link
                                        href={`/destinations?country=${encodeURIComponent(country)}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {country}
                                    </Link>
                                </li>
                            </>
                        )}
                        <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                        <li className="text-gray-900 font-medium" aria-current="page">
                            {place}
                        </li>
                    </ol>
                </nav>

                {/* The photo sits in a rounded card with generous padding, so it is
                    tall enough to show the scene rather than being cropped to a
                    thin strip. Height comes from the content's padding. */}
                <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl">
                    <Image
                        src={bgImage}
                        alt={`${place}, ${country || "travel destination"}`}
                        fill
                        priority
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        className="object-cover brightness-75"
                    />

                    <div
                        className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/50 to-black/20"
                        aria-hidden="true"
                    />

                    <div className="relative px-6 py-10 sm:px-10 md:px-14 md:py-14 lg:px-16 lg:py-20">
                        <div className="max-w-3xl">
                            {(region || country) && (
                                <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-white/85 mb-4">
                                    <MapPin size={14} aria-hidden="true" />
                                    {[country, region].filter(Boolean).join(" · ")}
                                </p>
                            )}

                            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] drop-shadow-lg">
                                {place}
                                {subhead && (
                                    <span className="block text-white/70 font-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-2 md:mt-3">
                                        {subhead}
                                    </span>
                                )}
                            </h1>

                            <p className="text-sm sm:text-base md:text-lg text-white/85 leading-relaxed max-w-2xl mt-4 md:mt-5 drop-shadow">
                                {subtitle}
                            </p>

                            {/* Real figures only — the block disappears when there is no data */}
                            {stats.length > 0 && (
                                <dl className="flex flex-wrap items-end gap-x-8 sm:gap-x-12 gap-y-4 mt-6 md:mt-8">
                                    {stats.map((stat) => (
                                        <div key={stat.value + stat.label}>
                                            <dd className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-none drop-shadow">
                                                {stat.value}
                                            </dd>
                                            <dt className="text-xs sm:text-sm text-white/70 mt-1.5">{stat.label}</dt>
                                        </div>
                                    ))}
                                </dl>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 mt-7 md:mt-9">
                                <Link
                                    href="#best-tours"
                                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-7 rounded-xl transition-colors shadow-lg"
                                >
                                    See all trips
                                    <ChevronRight size={18} aria-hidden="true" />
                                </Link>
                                <Link
                                    href="#customize-trip"
                                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/40 text-white font-semibold py-3.5 px-7 rounded-xl transition-colors"
                                >
                                    Talk to a travel advisor
                                </Link>
                            </div>
                        </div>

                        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 md:mt-10 pt-5 md:pt-6 border-t border-white/20">
                            {TRUST_POINTS.map((point) => (
                                <li
                                    key={point}
                                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90"
                                >
                                    <span className="bg-primary rounded-full p-1 text-white">
                                        <Check size={11} strokeWidth={3.5} aria-hidden="true" />
                                    </span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
