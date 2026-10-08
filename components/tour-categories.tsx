"use client"

import Link from "next/link"
import { ArrowRight, CalendarCheck, Check, Lock, Users } from "lucide-react"
import SectionHeading from "@/components/section-heading"

/**
 * Private vs group, as a side-by-side comparison rather than two image cards.
 * The two options differ in how they work, not in how they look, so the layout
 * leads with the differences.
 */
const OPTIONS = [
    {
        key: "private",
        icon: Lock,
        title: "Private trip",
        pitch: "Just your group. Your dates, your pace, your hotels.",
        points: [
            "Travel on the dates you pick",
            "Change the route or stay longer anywhere",
            "Choose your own hotel category",
        ],
        links: [
            { label: "In India", href: "/tours?tourCategory=PRIVATE&type=domestic" },
            { label: "Abroad", href: "/tours?tourCategory=PRIVATE&type=international" },
        ],
        featured: false,
    },
    {
        key: "group",
        icon: Users,
        title: "Group departure",
        pitch: "Fixed dates, a set route, and the cost shared with others.",
        points: [
            "Lower cost per person",
            "Meet other travellers on the road",
            "Everything planned and led for you",
        ],
        links: [
            { label: "In India", href: "/tours?tourCategory=GROUP&type=domestic" },
            { label: "Abroad", href: "/tours?tourCategory=GROUP&type=international" },
        ],
        featured: true,
    },
]

export default function TourCategories() {
    return (
        <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Travel style"
                    title="Private trip or group departure?"
                    subtitle="Two ways to travel with us. The difference is who you travel with and who picks the dates."
                />

                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    {OPTIONS.map((option) => {
                        const Icon = option.icon
                        return (
                            <div
                                key={option.key}
                                className={`relative flex flex-col rounded-2xl border p-6 md:p-8 transition-colors ${option.featured
                                    ? "border-primary/30 bg-white"
                                    : "border-gray-200 bg-white"
                                    }`}
                            >
                                {option.featured && (
                                    <span className="absolute -top-2.5 left-6 bg-primary text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                        Best value
                                    </span>
                                )}

                                <span
                                    className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${option.featured ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    <Icon size={20} aria-hidden="true" />
                                </span>

                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                                    {option.title}
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 mt-1.5">{option.pitch}</p>

                                <ul className="space-y-2.5 mt-6 mb-7 grow">
                                    {option.points.map((point) => (
                                        <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                                            <Check
                                                size={15}
                                                strokeWidth={3}
                                                className="text-primary shrink-0 mt-0.5"
                                                aria-hidden="true"
                                            />
                                            <span className="min-w-0 leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-100">
                                    {option.links.map((link, index) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${index === 0
                                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                                : "border border-gray-300 text-gray-800 hover:border-gray-900"
                                                }`}
                                        >
                                            {link.label}
                                            <ArrowRight size={15} aria-hidden="true" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-6">
                    <CalendarCheck size={13} aria-hidden="true" />
                    Not sure which suits you? Tell us your dates and we will suggest one.
                </p>
            </div>
        </section>
    )
}
