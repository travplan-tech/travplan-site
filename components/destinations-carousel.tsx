"use client"

import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"
import Image from "next/image"
import Link from "next/link"
import DestinationMarqueeRow from "@/components/destination-marquee-row"
import { useRef, useState, useEffect, useMemo } from "react"

type FilterType = 'ALL' | 'DOMESTIC' | 'INTERNATIONAL';

export default function DestinationsCarousel() {
    // Fetch destinations
    const { data: destinations = [], isLoading } = useGetDestinationsQuery()
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL')

    // Filter to ensure we have images and valid data
    const validDestinations = destinations.filter(dest => dest.image && dest.name)

    // Apply domestic/international filter
    const filteredDestinations = useMemo(() => {
        if (selectedFilter === 'DOMESTIC') {
            return validDestinations.filter(dest => 
                dest.country?.toLowerCase() === 'india' && dest.name?.toLowerCase() !== 'india'
            )
        } else if (selectedFilter === 'INTERNATIONAL') {
            return validDestinations.filter(dest => 
                dest.country?.toLowerCase() !== 'india'
            )
        }
        return validDestinations
    }, [validDestinations, selectedFilter])


    // Skeleton loading state
    if (isLoading) {
        return (
            <div className="py-8">
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse" />
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (filteredDestinations.length === 0 && !isLoading) {
        return (
            <div className="py-8 md:py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">Explore <span className="text-primary">Destinations</span></h2>
                        
                        {/* Filter Toggle Buttons */}
                        <div className="flex h-10 md:h-12">
                            <button
                                onClick={() => setSelectedFilter('DOMESTIC')}
                                className={`font-semibold px-3 md:px-6 rounded-l-md flex items-center transition-colors text-sm md:text-base ${selectedFilter === 'DOMESTIC'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <span>Domestic</span>
                            </button>
                            <button
                                onClick={() => setSelectedFilter('INTERNATIONAL')}
                                className={`font-semibold px-3 md:px-6 rounded-r-md flex items-center transition-colors text-sm md:text-base ${selectedFilter === 'INTERNATIONAL'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <span>International</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-500 text-center py-8">No destinations found for this filter.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 md:py-12 bg-white">
            {/* Hide webkit scrollbar */}
            <style jsx>{`
                #destinations-scroll-container::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-5">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
                            Where to
                        </p>
                        <h2 className="font-heading text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 tracking-tight">
                            Explore destinations
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 mt-2">
                            From Himalayan valleys to island escapes — pick a place and see every trip we run there.
                        </p>
                    </div>

                    {/* Filter Toggle Buttons */}
                    <div className="inline-flex shrink-0 rounded-xl bg-gray-100 p-1">
                        <button
                            onClick={() => setSelectedFilter('DOMESTIC')}
                            className={`font-semibold px-4 py-2 rounded-lg transition-colors text-sm ${selectedFilter === 'DOMESTIC'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <span>Domestic</span>
                        </button>
                        <button
                            onClick={() => setSelectedFilter('INTERNATIONAL')}
                            className={`font-semibold px-4 py-2 rounded-lg transition-colors text-sm ${selectedFilter === 'INTERNATIONAL'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <span>International</span>
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    {/* Two rows drifting in opposite directions; each stays
                        draggable and scrollable by hand. */}
                    <div className="space-y-6 md:space-y-8">
                        {(() => {
                            const half = Math.ceil(filteredDestinations.length / 2)
                            const rows = [
                                filteredDestinations.slice(0, half),
                                filteredDestinations.slice(half),
                            ]
                            return rows.map((row, rowIndex) =>
                                row.length === 0 ? null : (
                                    <DestinationMarqueeRow
                                        key={rowIndex}
                                        destinations={row}
                                        direction={rowIndex === 0 ? "right" : "left"}
                                    />
                                )
                            )
                        })()}
                    </div>

                    {/* Fade the edges so items enter and leave softly */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-white to-transparent z-10" />
                </div>
            </div>
        </div>
    )
}
