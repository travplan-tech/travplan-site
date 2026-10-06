"use client"

import {
    BedDouble,
    CalendarRange,
    Clock,
    MapPin,
    Plane,
    Route,
    Sparkles,
    UserRound,
    Users,
} from "lucide-react"

interface PackageOverviewProps {
    duration?: string | null
    tourType?: string | null
    tourCategory?: string | null
    maxPersons?: number | null
    ageRange?: string | null
    flightsIncluded?: boolean
    accommodation?: string | null
    isCustomizable?: boolean
    departurePoints?: string[]
    destinationName?: string | null
    /** Cities the trip passes through */
    cities?: string[]
}

/**
 * The key facts about a package, as a labelled icon grid.
 *
 * The previous version mixed label/value order between cells (some showed the
 * value as the heading, some the label) and showed "N/A" for anything missing,
 * so the block read as noise. Here each cell is label-then-value, and a cell is
 * dropped entirely when there is nothing real to show.
 */
export default function PackageOverview({
    duration,
    tourType,
    tourCategory,
    maxPersons,
    ageRange,
    flightsIncluded,
    accommodation,
    isCustomizable,
    departurePoints = [],
    destinationName,
    cities = [],
}: PackageOverviewProps) {
    // The cities field is stored as a single string using mixed separators,
    // e.g. "Delhi - Jammu - Pahalgam, Gulmarg", so split on both.
    const stops = cities
        .flatMap((c) => c.split(/\s*[-–,]\s*/))
        .map((c) => c.trim())
        .filter(Boolean)

    // Prefer explicit departure points; otherwise derive the route from stops.
    const route = departurePoints.length > 0 ? departurePoints : stops
    const start = route[0] || destinationName || null
    const end = route.length > 1 ? route[route.length - 1] : null

    const facts = [
        duration ? { icon: Clock, label: "Duration", value: duration } : null,
        start
            ? {
                icon: Route,
                label: end && end !== start ? "Route" : "Starts from",
                value: end && end !== start ? `${start} → ${end}` : start,
            }
            : null,
        tourCategory
            ? {
                icon: Users,
                label: "Trip type",
                value: tourCategory === "GROUP" ? "Group tour" : "Private tour",
            }
            : null,
        maxPersons ? { icon: UserRound, label: "Max group size", value: `${maxPersons} people` } : null,
        tourType ? { icon: Sparkles, label: "Best for", value: tourType.split(",")[0].trim() } : null,
        ageRange ? { icon: CalendarRange, label: "Age range", value: ageRange } : null,
        accommodation ? { icon: BedDouble, label: "Stays", value: accommodation } : null,
        typeof flightsIncluded === "boolean"
            ? { icon: Plane, label: "Flights", value: flightsIncluded ? "Included" : "Not included" }
            : null,
    ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[]

    if (facts.length === 0) return null

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Trip at a glance</h2>
                {isCustomizable && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                        <Sparkles size={12} aria-hidden="true" />
                        Customisable
                    </span>
                )}
            </div>

            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5">
                {facts.map((fact) => {
                    const Icon = fact.icon
                    return (
                        <div key={fact.label} className="flex gap-3">
                            <span className="shrink-0 w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                <Icon size={16} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <dt className="text-xs text-gray-500">{fact.label}</dt>
                                <dd className="text-sm font-semibold text-gray-900 leading-snug mt-0.5 break-words">
                                    {fact.value}
                                </dd>
                            </div>
                        </div>
                    )
                })}
            </dl>

            {stops.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <MapPin size={12} aria-hidden="true" />
                        Places you will visit
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(stops)).map((city) => (
                            <span
                                key={city}
                                className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md"
                            >
                                {city}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
