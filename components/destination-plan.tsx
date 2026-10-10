"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { CalendarCheck, MessageCircle, Route, ShieldCheck } from "lucide-react"
import { useGetExpertsQuery, useGetDestinationExpertsQuery } from "@/lib/api/publicApi"
import SectionHeading from "@/components/section-heading"
import ExpertCarousel from "@/components/expert-carousel"

interface Expert {
    id: number
    name: string
    bio?: string | null
    avatar?: string | null
    expertise?: string | null
    whatsappNumber?: string | null
    type?: string | null
    isActive?: boolean
}

const REASONS = [
    {
        icon: Route,
        title: "Itinerary built around you",
        body: "Change the route, the pace or the hotel category — we re-plan and re-quote.",
    },
    {
        icon: CalendarCheck,
        title: "Dates that suit you",
        body: "Fixed departures or a private trip on the days you want.",
    },
    {
        icon: ShieldCheck,
        title: "Local operators we work with",
        body: "The same partners run these trips for us every season.",
    },
]

export default function DestinationPlan({
    destinationName,
    country,
    destinationId,
}: {
    destinationName?: string | null
    country?: string | null
    /** When given, this destination's own named expert is shown first */
    destinationId?: number
}) {
    const place = destinationName?.trim().replace(/\s*,\s*$/, "")

    // Open on the domestic team for India and when no country is given (the
    // homepage), since almost all inventory is domestic.
    const countryKey = (country || "").trim().toLowerCase()
    const defaultType = !countryKey || countryKey === "india" ? "Domestic" : "International"
    const [type, setType] = useState(defaultType)
    const [touched, setTouched] = useState(false)

    // country arrives after the first render, so adopt the correct default once
    // it does — unless the visitor has already picked a tab themselves.
    useEffect(() => {
        if (!touched) setType(defaultType)
    }, [defaultType, touched])

    const { data, isLoading } = useGetExpertsQuery(type)
    const { data: destinationExperts } = useGetDestinationExpertsQuery(destinationId as number, {
        skip: !destinationId,
    })

    const named = useMemo(
        () => ((destinationExperts as Expert[] | undefined) || []).filter((e) => e.isActive !== false),
        [destinationExperts]
    )

    const experts = useMemo(() => {
        const list = ((data as Expert[] | undefined) || []).filter((e) => e.isActive !== false)
        // The destination's own expert leads, then the rest of that team.
        const namedIds = new Set(named.map((e) => e.id))
        return [...named, ...list.filter((e) => !namedIds.has(e.id))]
    }, [data, named])

    return (
        <section
            id="customize-trip"
            className="scroll-mt-24 py-14 md:py-20 bg-gray-50 border-y border-gray-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Plan with us"
                    title={place ? `Not sure which ${place} trip?` : "Not sure which trip?"}
                    subtitle="Tell us your dates, group size and budget. Our team replies on WhatsApp with options that actually fit."
                />

                {/* Why plan with us */}
                <ul className="grid sm:grid-cols-3 gap-4 mb-10 min-w-0">
                    {REASONS.map((reason) => {
                        const Icon = reason.icon
                        return (
                            <li
                                key={reason.title}
                                className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 min-w-0"
                            >
                                <span className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Icon size={20} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900">{reason.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{reason.body}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>

                {/* The people who will actually answer */}
                <div className="flex items-center justify-between gap-4 mb-5">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Talk to a trip expert</h3>
                    <div className="inline-flex shrink-0 rounded-lg bg-gray-100 p-1">
                        {["Domestic", "International"].map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    setTouched(true)
                                    setType(option)
                                }}
                                aria-pressed={type === option}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${type === option
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex gap-4 md:gap-5 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="shrink-0 w-[260px] sm:w-[300px] h-80 rounded-2xl bg-gray-100 animate-pulse"
                            />
                        ))}
                    </div>
                ) : experts.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6">
                        No {type.toLowerCase()} expert is listed right now — send us a message and the
                        team will pick it up.
                    </p>
                ) : (
                    <ExpertCarousel
                        experts={experts}
                        namedIds={named.map((e) => e.id)}
                        place={place}
                    />
                )}
            </div>
        </section>
    )
}
