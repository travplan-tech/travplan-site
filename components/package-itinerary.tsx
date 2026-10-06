"use client"

import { useState } from "react"
import { BedDouble, ChevronDown, Flag, MapPin } from "lucide-react"

interface ItineraryDay {
    day: number
    title: string
    description: string
    showAccommodation?: boolean
}

/**
 * Day-by-day itinerary as a timeline.
 *
 * Each day is a card so the text has somewhere to sit, with the day number in
 * the rail beside it. On phones the rail collapses to a compact badge row so
 * long day titles are not squeezed into a narrow column.
 */
export default function PackageItinerary({
    days,
    accommodation,
}: {
    days: ItineraryDay[]
    accommodation?: string | null
}) {
    const [open, setOpen] = useState<Record<number, boolean>>(() =>
        days.length > 0 ? { [days[0].day]: true } : {}
    )

    if (days.length === 0) return null

    const allOpen = days.every((d) => open[d.day])

    const toggleAll = () => {
        if (allOpen) {
            setOpen({})
        } else {
            setOpen(Object.fromEntries(days.map((d) => [d.day, true])))
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-5">
                <p className="text-sm text-gray-500">
                    {days.length} {days.length === 1 ? "day" : "days"}, planned out
                </p>
                <button
                    type="button"
                    onClick={toggleAll}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    {allOpen ? "Collapse all" : "Expand all"}
                </button>
            </div>

            <ol className="relative">
                {days.map((dayData, index) => {
                    const isOpen = Boolean(open[dayData.day])
                    const isLast = index === days.length - 1

                    return (
                        <li key={dayData.day} className="relative flex gap-4 sm:gap-5">
                            {/* Rail: number badge plus the connecting line */}
                            <div className="relative flex flex-col items-center shrink-0">
                                <span
                                    className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold transition-colors ${isOpen
                                        ? "bg-primary text-white shadow-md shadow-primary/30"
                                        : "bg-primary/10 text-primary"
                                        }`}
                                >
                                    {isLast ? <Flag size={16} aria-hidden="true" /> : dayData.day}
                                </span>
                                {!isLast && <span className="w-0.5 grow bg-gray-200" aria-hidden="true" />}
                            </div>

                            <div className={`grow min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                                <div
                                    className={`rounded-2xl border transition-colors ${isOpen ? "border-primary/30 bg-white shadow-sm" : "border-gray-200 bg-white"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpen((prev) => ({ ...prev, [dayData.day]: !prev[dayData.day] }))
                                        }
                                        aria-expanded={isOpen}
                                        className="flex items-start justify-between gap-3 w-full text-left p-4 sm:p-5"
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-1">
                                                Day {dayData.day}
                                            </span>
                                            <span className="block text-base sm:text-lg font-bold text-gray-900 leading-snug">
                                                {dayData.title}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            size={20}
                                            aria-hidden="true"
                                            className={`shrink-0 mt-1 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-4 sm:px-5 pb-5 -mt-1">
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                                                {dayData.description}
                                            </p>

                                            {accommodation && dayData.showAccommodation !== false && (
                                                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mt-4">
                                                    <BedDouble size={16} className="text-primary shrink-0" aria-hidden="true" />
                                                    <p className="text-sm text-gray-700 min-w-0">
                                                        <span className="font-semibold text-gray-900">Stay: </span>
                                                        {accommodation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ol>

            <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-5">
                <MapPin size={12} aria-hidden="true" />
                Day order can shift with weather and road conditions.
            </p>
        </div>
    )
}
