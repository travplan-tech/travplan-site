"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, Star, Users } from "lucide-react"
import FavoriteButton from "@/components/FavoriteButton"
import BrochureDialog from "@/components/BrochureDialog"
import { useGetPackagesByDestinationQuery } from "@/lib/api/packagesApi"
import SectionHeading from "@/components/section-heading"

interface DestinationTripsProps {
    destinationId?: number
    /** Human label, e.g. "Tawang" */
    destinationName?: string | null
}

function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
            <div className="h-52 bg-gray-200 animate-pulse" />
            <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-4" />
            </div>
        </div>
    )
}

export default function DestinationTrips({ destinationId, destinationName }: DestinationTripsProps) {
    const [brochure, setBrochure] = useState<{
        isOpen: boolean
        packageId: number
        packageName: string
        brochureUrl: string | null
    }>({ isOpen: false, packageId: 0, packageName: "", brochureUrl: null })

    const { data, isLoading } = useGetPackagesByDestinationQuery(destinationId as number, {
        skip: !destinationId,
    })

    const packages = Array.isArray(data) ? data : []
    const place = destinationName?.trim().replace(/\s*,\s*$/, "")

    return (
        <section id="best-tours" className="scroll-mt-24 py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Trips"
                    title={place ? `${place} trips` : "All trips"}
                    subtitle={
                        place
                            ? `Every ${place} itinerary we run, with what each one covers and what it costs.`
                            : "Every itinerary we run, with what each one covers and what it costs."
                    }
                    action={
                        destinationId
                            ? { href: `/tours?destinationId=${destinationId}`, label: "Browse all tours" }
                            : undefined
                    }
                />

                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : packages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                        <p className="text-gray-500">
                            No trips listed here yet. Tell us your dates and we will plan one.
                        </p>
                        <Link
                            href="#customize-trip"
                            className="inline-flex items-center gap-2 text-primary font-semibold mt-3 hover:underline"
                        >
                            Plan a custom trip
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => {
                            const saving =
                                pkg.originalPrice && pkg.originalPrice > pkg.price
                                    ? pkg.originalPrice - pkg.price
                                    : 0
                            // Ratings render only when a package genuinely has reviews.
                            const hasRating = typeof pkg.rating === "number" && pkg.rating > 0
                            const tourTypes = (pkg.tourType || "")
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)

                            return (
                                <article
                                    key={pkg.id}
                                    className="group relative flex flex-col justify-end overflow-hidden rounded-3xl min-h-[420px] md:min-h-[460px] bg-gray-900 transition-transform duration-300 hover:-translate-y-1"
                                >
                                    {/* The photograph fills the card; everything else sits over it */}
                                    <Image
                                        src={pkg.image || "/placeholder.jpg"}
                                        alt={pkg.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10"
                                        aria-hidden="true"
                                    />

                                    {/* Top row: duration and saving */}
                                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            {pkg.duration && (
                                                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
                                                    <Clock size={12} aria-hidden="true" />
                                                    {pkg.duration}
                                                </span>
                                            )}
                                            {pkg.tourCategory && (
                                                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
                                                    <Users size={12} aria-hidden="true" />
                                                    {pkg.tourCategory === "PRIVATE" ? "Private" : "Group"}
                                                </span>
                                            )}
                                        </div>
                                        <FavoriteButton packageId={pkg.id} size="sm" className="shrink-0" />
                                    </div>

                                    {saving > 0 && (
                                        <span className="absolute top-16 left-4 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                                            Save ₹{saving.toLocaleString("en-IN")}
                                        </span>
                                    )}

                                    {/* Content panel */}
                                    <div className="relative p-5 md:p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            {hasRating && (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-white">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                                                    {pkg.rating.toFixed(1)}
                                                </span>
                                            )}
                                            {tourTypes.slice(0, 2).map((type) => (
                                                <span key={type} className="text-xs text-white/70">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2 drop-shadow">
                                            {pkg.title}
                                        </h3>

                                        {pkg.description && (
                                            <p className="text-sm text-white/70 leading-relaxed line-clamp-2 mt-2">
                                                {pkg.description}
                                            </p>
                                        )}

                                        <div className="flex items-end justify-between gap-3 mt-5 pt-4 border-t border-white/20">
                                            <div>
                                                <p className="text-[11px] text-white/60">per person from</p>
                                                <p className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-white leading-none">
                                                        ₹{pkg.price.toLocaleString("en-IN")}
                                                    </span>
                                                    {saving > 0 && pkg.originalPrice && (
                                                        <span className="text-sm text-white/50 line-through">
                                                            ₹{pkg.originalPrice.toLocaleString("en-IN")}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/destinations/trip/${pkg.id}`}
                                                className="shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-white/90 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
                                            >
                                                View
                                                <ArrowRight size={15} aria-hidden="true" />
                                            </Link>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBrochure({
                                                    isOpen: true,
                                                    packageId: pkg.id,
                                                    packageName: pkg.title,
                                                    brochureUrl: pkg.itineraryPdf ?? null,
                                                })
                                            }
                                            className="w-full mt-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                                        >
                                            Download itinerary
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>

            <BrochureDialog
                isOpen={brochure.isOpen}
                onClose={() => setBrochure((b) => ({ ...b, isOpen: false }))}
                packageId={brochure.packageId}
                packageName={brochure.packageName}
                brochureUrl={brochure.brochureUrl}
            />
        </section>
    )
}
