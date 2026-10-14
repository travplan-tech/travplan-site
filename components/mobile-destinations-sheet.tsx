"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"
import MobileSheet, { SheetRow, SheetRowSkeleton } from "@/components/mobile-sheet"

interface Destination {
    id: number
    name: string
    country: string | null
    region: string | null
    image: string | null
    tours: number
}

type Filter = "all" | "domestic" | "international"

const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "domestic", label: "In India" },
    { key: "international", label: "Abroad" },
]

const isIndia = (d: Destination) => (d.country || "").trim().toLowerCase() === "india"

/**
 * Every destination, grouped by region, for the phone navigation bar.
 *
 * Destinations with no trips are listed last and labelled, rather than hidden:
 * they are real places the company covers, but tapping one would otherwise
 * land on an empty list with no explanation.
 */
export default function MobileDestinationsSheet({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const router = useRouter()
    const [filter, setFilter] = useState<Filter>("all")
    const { data, isLoading } = useGetDestinationsQuery(undefined, { skip: !open })

    const groups = useMemo(() => {
        const all = ((data as Destination[]) || []).filter((d) => d.name)
        const scoped = all.filter((d) =>
            filter === "all" ? true : filter === "domestic" ? isIndia(d) : !isIndia(d)
        )

        // Region first, then trip count, so the useful entries lead each group.
        const byRegion = new Map<string, Destination[]>()
        for (const d of scoped) {
            const key = d.region?.trim() || "Other"
            byRegion.set(key, [...(byRegion.get(key) || []), d])
        }

        return [...byRegion.entries()]
            .map(([region, items]) => ({
                region,
                items: [...items].sort((a, b) => (b.tours || 0) - (a.tours || 0)),
                withTrips: items.filter((d) => d.tours > 0).length,
            }))
            .sort((a, b) => b.withTrips - a.withTrips || a.region.localeCompare(b.region))
    }, [data, filter])

    const total = groups.reduce((n, g) => n + g.items.length, 0)

    const go = (d: Destination) => {
        onClose()
        // A destination with no trips goes to its landing page rather than an
        // empty results list.
        router.push(d.tours > 0 ? `/tours?destinationId=${d.id}` : `/destinations?country=${encodeURIComponent(d.country || d.name)}`)
    }

    return (
        <MobileSheet
            open={open}
            onClose={onClose}
            title="Destinations"
            header={
                <div className="flex gap-2 px-4 pb-3 shrink-0">
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            aria-pressed={filter === key}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${filter === key
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            }
        >
            {isLoading && <SheetRowSkeleton rows={6} />}

            {!isLoading && total === 0 && (
                <p className="px-4 py-10 text-center text-sm text-gray-500">
                    No destinations in this group yet.
                </p>
            )}

            {!isLoading &&
                groups.map(({ region, items }) => (
                    <section key={region}>
                        <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {region}
                        </p>
                        {items.map((d) => (
                            <SheetRow
                                key={d.id}
                                onClick={() => go(d)}
                                thumbnail={
                                    d.image ? (
                                        <Image src={d.image} alt="" fill sizes="48px" className="object-cover" />
                                    ) : (
                                        <MapPin size={16} className="absolute inset-0 m-auto text-gray-400" aria-hidden="true" />
                                    )
                                }
                                title={d.name}
                                subtitle={
                                    d.tours > 0
                                        ? `${d.tours} ${d.tours === 1 ? "trip" : "trips"}`
                                        : "Enquire for dates"
                                }
                            />
                        ))}
                    </section>
                ))}

            {!isLoading && total > 0 && (
                <button
                    type="button"
                    onClick={() => {
                        onClose()
                        router.push("/destinations")
                    }}
                    className="w-full mt-4 mb-2 py-3 text-sm font-semibold text-primary"
                >
                    Browse all destinations
                </button>
            )}
        </MobileSheet>
    )
}
