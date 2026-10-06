"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface Faq {
    q: string
    a: string
}

/**
 * Questions that are true for any destination. These deliberately point to the
 * package page for specifics rather than stating policies that vary by trip.
 */
function genericFaqs(place?: string): Faq[] {
    const where = place ? ` to ${place}` : ""
    return [
        {
            q: `How do I book a trip${where}?`,
            a: "Send us your travel dates and group size using the enquiry form or on WhatsApp. Our team checks availability, shares the detailed day-by-day itinerary and confirms the booking with you before anything is paid.",
        },
        {
            q: "Can the itinerary be customised?",
            a: "Yes. Most packages can be adjusted for duration, hotel category, sightseeing and departure city. Tell us what you would like changed and we will send a revised itinerary and quote.",
        },
        {
            q: "What is included in the package price?",
            a: "Each package page lists its own inclusions and exclusions, which usually cover stays, transfers, listed sightseeing and selected meals. Flights, visas and personal expenses are listed separately where they apply.",
        },
        {
            q: place ? `When is the best time to visit ${place}?` : "When is the best time to travel?",
            a: "The ideal window depends on the route and the weather, and it differs across our packages. Share your preferred month and our team will tell you what the conditions are like and suggest alternatives if needed.",
        },
    ]
}

/** Destination-specific questions, keyed by lower-cased destination name. */
const FAQS_BY_PLACE: Record<string, Faq[]> = {
    nepal: [
        {
            q: "How much money do I need to bring with me?",
            a: "Nepal is an affordable destination. Budget depends on your travel style and preferences.",
        },
        {
            q: "How much will a trip to Nepal cost?",
            a: "Costs vary based on duration, season, and travel style. Tours range from budget to luxury options.",
        },
        {
            q: "When should I arrive in Kathmandu, before the tour?",
            a: "We recommend arriving at least a day before your tour starts to acclimate.",
        },
        {
            q: "What is the typical tipping amount to the porters and guide?",
            a: "Tipping is appreciated at 5-10% of your tour cost or per day basis.",
        },
    ],
}

export default function FAQ({
    destination,
    variant = "default",
}: {
    destination?: string | null
    /** "featured" matches the redesigned destination page sections */
    variant?: "default" | "featured"
}) {
    const [open, setOpen] = useState<number | null>(0)

    const place = destination?.trim().replace(/\s*,\s*$/, "") || undefined
    const faqs = (place && FAQS_BY_PLACE[place.toLowerCase()]) || genericFaqs(place)

    return (
        <section className={variant === "featured" ? "py-14 md:py-20" : "py-10 md:py-16"}>
            <div className={variant === "featured" ? "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" : "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"}>
                {variant === "featured" ? (
                    <div className="mb-8 md:mb-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
                            Good to know
                        </p>
                        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                            {place ? `Planning a trip to ${place}` : "Frequently asked questions"}
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 mt-2">
                            The questions travellers ask us most before booking.
                        </p>
                    </div>
                ) : (
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
                        {place
                            ? `Frequently Asked Questions about traveling to ${place}`
                            : "Frequently Asked Questions"}
                    </h2>
                )}

                <div className="space-y-3 md:space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={faq.q} className="border border-gray-200 rounded-lg">
                            <button
                                onClick={() => setOpen(open === idx ? null : idx)}
                                aria-expanded={open === idx}
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center hover:bg-gray-50 transition gap-3"
                            >
                                <span className="text-gray-900 font-semibold text-left text-sm sm:text-base">{faq.q}</span>
                                <ChevronDown
                                    size={20}
                                    aria-hidden="true"
                                    className={`text-primary shrink-0 transition ${open === idx ? "rotate-180" : ""}`}
                                />
                            </button>
                            {open === idx && (
                                <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-600 border-t border-gray-200 text-sm sm:text-base">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
