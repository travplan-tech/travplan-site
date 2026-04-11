"use client"

import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useEffect, useMemo } from "react"

type FilterType = 'ALL' | 'DOMESTIC' | 'INTERNATIONAL';

export default function DestinationsCarousel() {
    // Fetch destinations
    const { data: destinations = [], isLoading } = useGetDestinationsQuery()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [scrollProgress, setScrollProgress] = useState(0)
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

    // Handle scroll to update progress indicator
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            const maxScroll = scrollWidth - clientWidth
            const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
            setScrollProgress(progress)
        }
    }

    useEffect(() => {
        const container = scrollContainerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            // Initial calculation
            handleScroll()
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [filteredDestinations])

    // Reset scroll position when filter changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0
            setScrollProgress(0)
        }
    }, [selectedFilter])

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

                <div className="relative group">
                    {/* Scrollable Container */}
                    <div
                        id="destinations-scroll-container"
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-x-8 gap-y-8 pb-4 pt-2 snap-x"
                        style={{
                            display: 'grid',
                            gridTemplateRows: 'repeat(2, min-content)',
                            gridAutoFlow: 'column',
                            gridAutoColumns: 'min-content',
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE/Edge
                        }}
                    >
                        {filteredDestinations.map((dest) => (
                            <Link
                                key={dest.id}
                                href={`/tours?search=${encodeURIComponent(dest.name)}`}
                                className="flex flex-col items-center gap-3 group/item w-24 md:w-32 snap-start"
                            >
                                <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-full shadow-md border-2 border-transparent group-hover/item:border-primary transition-all duration-300">
                                    <Image
                                        src={dest.image || "/placeholder.jpg"}
                                        alt={dest.name}
                                        fill
                                        sizes="(max-width: 768px) 96px, 128px"
                                        className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                                    />
                                </div>
                                <span className="text-sm md:text-base font-medium text-gray-700 text-center group-hover/item:text-primary transition-colors w-full px-1">
                                    {dest.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Custom Scroll Progress Bar */}
                    <div
                        className="mt-4 h-2 bg-purple-100 rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            if (scrollContainerRef.current) {
                                const bar = e.currentTarget;
                                const rect = bar.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const percent = clickX / rect.width;
                                const { scrollWidth, clientWidth } = scrollContainerRef.current;
                                scrollContainerRef.current.scrollTo({
                                    left: percent * (scrollWidth - clientWidth),
                                    behavior: 'smooth'
                                });
                            }
                        }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-150 ease-out"
                            style={{
                                width: '20%',
                                marginLeft: `${scrollProgress * 0.8}%`,
                                background: 'linear-gradient(90deg, #8745d1 0%, #a855f7 50%, #8745d1 100%)'
                            }}
                        />
                    </div>

                    {/* Fade effect on sides */}
                    <div className="absolute top-0 right-0 h-[calc(100%-2rem)] w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    )
}
