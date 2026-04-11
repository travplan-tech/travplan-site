"use client"

import Image from "next/image"
import Link from "next/link"

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
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Choose Your Travel <span className="text-primary">Style</span></h2>
                        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                            Choose your preferred travel style - whether you want a private exclusive experience or joining a fun group of travelers.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {sections.map((section) => (
                        <div key={section.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            {/* Image Header */}
                            <div className="relative h-48 md:h-56 overflow-hidden">
                                <Image
                                    src={section.image}
                                    alt={section.title}
                                    fill
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
                                            className="flex items-center justify-center px-4 py-3  hover:bg-primary/20 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm md:text-base font-semibold hover:border-transparent transition-all duration-500"
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
