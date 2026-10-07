"use client"

import Image from "next/image"
import Link from "next/link"
import SectionHeading from "@/components/section-heading"

const sections = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
        title: "Private Tours",
        subtitle: "Flexible dates, custom stays, personal pace",
        tourCategory: "PRIVATE",
        options: [
            { label: "Domestic Tours", params: "country=India" },
            { label: "International Tours", params: "excludeCountry=India" },
        ]
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop",
        title: "Group Tours",
        subtitle: "Fixed dates, better values, social experience",
        tourCategory: "GROUP",
        options: [
            { label: "Domestic Tours", params: "country=India" },
            { label: "International Tours", params: "excludeCountry=India" },
        ]
    },
]

export default function TourCategories() {
    return (
        <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Travel style"
                    title="Private trip or group departure?"
                    subtitle="Travel on your own dates at your own pace, or join a fixed departure and share the cost."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {sections.map((section) => (
                        <div key={section.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                            {/* Image Header */}
                            <div className="relative h-36 md:h-44 overflow-hidden">
                                <Image
                                    src={section.image}
                                    alt={section.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg">{section.title}</h3>
                                    <p className="text-sm opacity-90 mt-1">{section.subtitle}</p>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="p-4 md:p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {section.options.map((option) => (
                                        <Link
                                            key={option.label}
                                            href={`/destinations?tourCategory=${section.tourCategory}&${option.params}`}
                                            className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
