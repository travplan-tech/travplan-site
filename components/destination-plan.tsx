"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { CalendarCheck, MessageCircle, Route, ShieldCheck } from "lucide-react"
import { useGetExpertsQuery, useGetDestinationExpertsQuery } from "@/lib/api/publicApi"
import SectionHeading from "@/components/section-heading"

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

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Why plan with us */}
                    <ul className="space-y-5">
                        {REASONS.map((reason) => {
                            const Icon = reason.icon
                            return (
                                <li
                                    key={reason.title}
                                    className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-5"
                                >
                                    <span className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon size={20} aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{reason.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{reason.body}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    {/* The people who will actually answer */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <h3 className="font-semibold text-gray-900">Talk to a trip expert</h3>
                            <div className="inline-flex rounded-lg bg-gray-100 p-1">
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
                            <div className="space-y-3">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : experts.length === 0 ? (
                            <p className="text-sm text-gray-500 py-6">
                                No {type.toLowerCase()} expert is listed right now — send us a message and the
                                team will pick it up.
                            </p>
                        ) : (
                            // A plain stacked list, so one or two experts look intentional
                            // rather than a carousel with nothing to scroll.
                            <ul className="space-y-3">
                                {experts.map((expert) => (
                                    <li
                                        key={expert.id}
                                        className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-primary/40 transition-colors"
                                    >
                                        <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-gray-100">
                                            {expert.avatar ? (
                                                <Image
                                                    src={expert.avatar}
                                                    alt={expert.name}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="min-w-0 grow">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {expert.name}
                                                {named.some((n) => n.id === expert.id) && place && (
                                                    <span className="ml-2 align-middle text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                        {place} expert
                                                    </span>
                                                )}
                                            </p>
                                            {expert.bio && (
                                                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{expert.bio}</p>
                                            )}
                                        </div>
                                        {expert.whatsappNumber && (
                                            <a
                                                href={`https://wa.me/${expert.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                                                    place
                                                        ? `Hi ${expert.name}, I am planning a trip to ${place}. Can you help?`
                                                        : `Hi ${expert.name}, I am planning a trip. Can you help?`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <MessageCircle size={14} aria-hidden="true" />
                                                Chat
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
