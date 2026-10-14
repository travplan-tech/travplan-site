"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MapPin, Package, Search, TrendingUp } from "lucide-react"
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"
import { useGetPackagesQuery } from "@/lib/api/packagesApi"
import MobileSheet, { SheetRow, SheetRowSkeleton } from "@/components/mobile-sheet"
import { readableTitle } from "@/lib/package-title"

interface Destination {
    id: number
    name: string
    country: string | null
    region: string | null
    image: string | null
    tours: number
}

interface Pkg {
    id: number
    title: string
    duration: string
    price: number
    image: string | null
    destination?: { name?: string | null } | null
}

/**
 * Destination and trip search as a bottom sheet.
 *
 * It searches both: destinations answer "where could I go", packages answer
 * "is there a trip called X". Both are listed under their own heading so it is
 * clear which is which, since tapping them leads to different places.
 */
export default function MobileSearchSheet({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [debounced, setDebounced] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const { data: destinations = [], isLoading: loadingDestinations } =
        useGetDestinationsQuery(undefined, { skip: !open })

    // Debounced so a package query does not fire on every keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebounced(query.trim()), 300)
        return () => clearTimeout(t)
    }, [query])

    const { data: packageData, isFetching: loadingPackages } = useGetPackagesQuery(
        { search: debounced, limit: 6 },
        { skip: !open || debounced.length < 2 }
    )

    useEffect(() => {
        if (!open) {
            setQuery("")
            setDebounced("")
            return
        }
        // Focus after the slide starts, or iOS scrolls the page oddly.
        const focus = setTimeout(() => inputRef.current?.focus(), 250)
        return () => clearTimeout(focus)
    }, [open])

    const matchedDestinations = useMemo(() => {
        const list = (destinations as Destination[]).filter((d) => d.name)
        const q = query.trim().toLowerCase()
        if (!q) {
            // Nothing typed: lead with the places that actually have trips.
            return [...list].sort((a, b) => (b.tours || 0) - (a.tours || 0)).slice(0, 6)
        }
        return list
            .filter((d) => [d.name, d.country, d.region].some((f) => f?.toLowerCase().includes(q)))
            .slice(0, 6)
    }, [destinations, query])

    const packages = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = packageData as any
        const list: Pkg[] = Array.isArray(raw) ? raw : raw?.packages || []
        return list.slice(0, 6)
    }, [packageData])

    const typing = query.trim().length > 0
    const waitingOnPackages = typing && debounced.length >= 2 && loadingPackages

    const go = (href: string) => {
        onClose()
        router.push(href)
    }

    return (
        <MobileSheet
            open={open}
            onClose={onClose}
            title="Where do you want to go?"
            header={
                <div className="px-4 pb-3 shrink-0">
                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                        />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && query.trim()) {
                                    go(`/tours?search=${encodeURIComponent(query.trim())}`)
                                }
                            }}
                            type="search"
                            enterKeyHint="search"
                            placeholder="Search destinations or trips"
                            aria-label="Search destinations or trips"
                            // 16px, or iOS Safari zooms the page on focus.
                            className="w-full h-12 pl-11 pr-4 bg-gray-100 rounded-xl text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                </div>
            }
        >
            {/* Destinations */}
            <p className="flex items-center gap-1.5 px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {typing ? <MapPin size={12} aria-hidden="true" /> : <TrendingUp size={12} aria-hidden="true" />}
                {typing ? "Destinations" : "Popular destinations"}
            </p>

            {loadingDestinations && <SheetRowSkeleton rows={4} />}

            {!loadingDestinations && matchedDestinations.length === 0 && (
                <p className="px-3 pb-3 text-sm text-gray-500">No matching destinations.</p>
            )}

            {!loadingDestinations &&
                matchedDestinations.map((d) => (
                    <SheetRow
                        key={d.id}
                        onClick={() => go(`/tours?destinationId=${d.id}`)}
                        thumbnail={
                            d.image ? (
                                <Image src={d.image} alt="" fill sizes="48px" className="object-cover" />
                            ) : (
                                <MapPin size={16} className="absolute inset-0 m-auto text-gray-400" aria-hidden="true" />
                            )
                        }
                        title={d.name}
                        subtitle={[d.country, d.tours ? `${d.tours} ${d.tours === 1 ? "trip" : "trips"}` : null]
                            .filter(Boolean)
                            .join(" · ")}
                    />
                ))}

            {/* Trips — only once there is something to match against */}
            {typing && (
                <>
                    <p className="flex items-center gap-1.5 px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        <Package size={12} aria-hidden="true" />
                        Trips
                    </p>

                    {waitingOnPackages && <SheetRowSkeleton rows={3} />}

                    {!waitingOnPackages && packages.length === 0 && (
                        <p className="px-3 pb-2 text-sm text-gray-500">
                            {debounced.length < 2 ? "Keep typing to search trips." : "No matching trips."}
                        </p>
                    )}

                    {!waitingOnPackages &&
                        packages.map((p) => (
                            <SheetRow
                                key={p.id}
                                onClick={() => go(`/destinations/trip/${p.id}`)}
                                thumbnail={
                                    p.image ? (
                                        <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                                    ) : (
                                        <Package size={16} className="absolute inset-0 m-auto text-gray-400" aria-hidden="true" />
                                    )
                                }
                                title={readableTitle(p.title, p.duration)}
                                subtitle={[
                                    p.destination?.name,
                                    p.price ? `From ₹${Math.round(p.price).toLocaleString("en-IN")}` : null,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            />
                        ))}

                    <SheetRow
                        onClick={() => go(`/tours?search=${encodeURIComponent(query.trim())}`)}
                        thumbnail={
                            <Search size={16} className="absolute inset-0 m-auto text-primary" aria-hidden="true" />
                        }
                        title={`See all results for “${query.trim()}”`}
                        subtitle="Search every trip"
                    />
                </>
            )}
        </MobileSheet>
    )
}
