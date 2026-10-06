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
                                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="relative h-52 overflow-hidden bg-gray-100">
                                        <Image
                                            src={pkg.image || "/placeholder.jpg"}
                                            alt={pkg.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div
                                            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent"
                                            aria-hidden="true"
                                        />

                                        <FavoriteButton
                                            packageId={pkg.id}
                                            size="sm"
                                            className="absolute top-3 right-3 z-10"
                                        />

                                        {saving > 0 && (
                                            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                Save ₹{saving.toLocaleString("en-IN")}
                                            </span>
                                        )}

                                        {pkg.duration && (
                                            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-white/95 text-gray-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                                                <Clock size={12} aria-hidden="true" />
                                                {pkg.duration}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col grow p-5">
                                        <div className="flex items-start gap-2 mb-2">
                                            <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-12 grow">
                                                {pkg.title}
                                            </h3>
                                            {hasRating && (
                                                <span className="shrink-0 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded-md">
                                                    <Star size={11} className="fill-amber-500 text-amber-500" aria-hidden="true" />
                                                    {pkg.rating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>

                                        {pkg.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 min-h-15">
                                                {pkg.description}
                                            </p>
                                        )}

                                        {/* tourType is stored comma-separated, so split it into
                                            individual chips and cap the row rather than letting
                                            one long string wrap across lines. */}
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {pkg.tourCategory && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                                                    <Users size={11} aria-hidden="true" />
                                                    {pkg.tourCategory === "PRIVATE" ? "Private" : "Group"}
                                                </span>
                                            )}
                                            {tourTypes.slice(0, 2).map((type) => (
                                                <span
                                                    key={type}
                                                    className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md"
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                            {tourTypes.length > 2 && (
                                                <span className="text-xs font-medium text-gray-500 px-1 py-1">
                                                    +{tourTypes.length - 2}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-5">
                                            <div className="flex items-end justify-between gap-2 pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500">per person from</p>
                                                    <p className="text-xl font-bold text-gray-900 leading-tight">
                                                        ₹{pkg.price.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                {saving > 0 && pkg.originalPrice && (
                                                    <p className="text-sm text-gray-400 line-through pb-1">
                                                        ₹{pkg.originalPrice.toLocaleString("en-IN")}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-4">
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
                                                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Itinerary
                                                </button>
                                                <Link
                                                    href={`/destinations/trip/${pkg.id}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    View trip
                                                    <ArrowRight size={15} aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </div>
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
