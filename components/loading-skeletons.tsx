"use client"

// Loading skeletons for different section types
export function HeroSkeleton() {
    return (
        <div className="relative pt-16 md:pt-20 pb-44 md:pb-40 bg-gray-200 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-0">
                <div className="h-12 md:h-16 w-3/4 bg-gray-300 rounded mb-4" />
                <div className="h-6 w-1/2 bg-gray-300 rounded mb-8" />
                <div className="h-16 w-full max-w-2xl bg-gray-300 rounded-xl" />
            </div>
        </div>
    )
}

export function CardGridSkeleton({ cards = 2 }: { cards?: number }) {
    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header skeleton */}
                <div className="mb-6 md:mb-8">
                    <div className="h-8 md:h-10 w-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-96 max-w-full bg-gray-200 rounded mt-2 animate-pulse" />
                </div>
                {/* Cards skeleton */}
                <div className={`grid grid-cols-1 md:grid-cols-${cards} gap-6 md:gap-8`}>
                    {Array.from({ length: cards }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                            <div className="h-48 md:h-56 bg-gray-200" />
                            <div className="p-4 md:p-5 space-y-3">
                                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="h-10 bg-gray-200 rounded-xl" />
                                    <div className="h-10 bg-gray-200 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function CarouselSkeleton({ items = 3 }: { items?: number }) {
    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header skeleton */}
                <div className="mb-6 md:mb-8">
                    <div className="h-8 md:h-10 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-80 max-w-full bg-gray-200 rounded mt-2 animate-pulse" />
                </div>
                {/* Carousel skeleton */}
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: items }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 animate-pulse">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                                <div className="aspect-4/3 bg-gray-200" />
                                <div className="p-4 md:p-5 space-y-3">
                                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-20 bg-gray-200 rounded" />
                                        <div className="h-4 w-16 bg-gray-200 rounded" />
                                    </div>
                                    <div className="h-4 w-full bg-gray-200 rounded" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                                    <div className="flex gap-3 mt-4">
                                        <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
                                        <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function TourTypesSkeleton() {
    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header skeleton */}
                <div className="mb-6 md:mb-8">
                    <div className="h-8 md:h-10 w-56 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-72 max-w-full bg-gray-200 rounded mt-2 animate-pulse" />
                </div>
                {/* Grid skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
                    ))}
                </div>
            </div>
        </section>
    )
}

export function TravelInfoSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
                {/* Text skeleton */}
                <div className="space-y-4 animate-pulse">
                    <div className="h-8 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                    <div className="h-4 w-4/5 bg-gray-200 rounded" />
                    <div className="h-6 w-1/2 bg-gray-200 rounded mt-6" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
                {/* Video skeleton */}
                <div className="lg:pl-8">
                    <div className="relative rounded-lg overflow-hidden shadow-2xl h-48 md:h-64 lg:h-80 bg-gray-200 animate-pulse" />
                </div>
            </div>
            {/* Feature boxes skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-lg bg-gray-100 animate-pulse">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-3" />
                        <div className="h-4 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded mt-2" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function CustomizeTripSkeleton() {
    return (
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <div className="flex-1 animate-pulse">
                        <div className="h-10 w-3/4 bg-gray-200 rounded mb-4" />
                        <div className="h-5 w-full bg-gray-200 rounded mb-2" />
                        <div className="h-5 w-2/3 bg-gray-200 rounded mb-6" />
                        <div className="h-12 w-48 bg-gray-300 rounded-xl" />
                    </div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export function VideoTestimonialsSkeleton() {
    return (
        <section className="py-10 md:py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4 md:px-8 lg:px-12">
                {/* Header skeleton */}
                <div className="text-center mb-8 md:mb-12 animate-pulse">
                    <div className="h-10 md:h-14 w-96 max-w-full mx-auto bg-gray-200 rounded" />
                    <div className="h-5 w-80 max-w-full mx-auto bg-gray-200 rounded mt-4" />
                </div>
                {/* Videos skeleton */}
                <div className="flex justify-center gap-6 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`shrink-0 ${i !== 1 ? 'hidden md:block' : ''}`}>
                            <div className="w-[240px] aspect-[9/16] rounded-3xl bg-gray-200 animate-pulse" />
                            <div className="text-center mt-4">
                                <div className="h-5 w-24 mx-auto bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function GallerySkeleton() {
    return (
        <section className="py-10 md:py-16 overflow-hidden">
            <div className="text-center mb-6 md:mb-10 animate-pulse">
                <div className="h-5 w-20 mx-auto bg-gray-200 rounded mb-3" />
                <div className="h-12 md:h-20 w-80 max-w-full mx-auto bg-gray-200 rounded" />
            </div>
            <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, row) => (
                    <div key={row} className="flex gap-5 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shrink-0 w-[300px] md:w-[450px] h-[150px] md:h-[200px] rounded-2xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}

export function TourAvailabilitySkeleton() {
    return (
        <div className="pt-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            {/* Month Selection Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 mb-8">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
            </div>
            {/* Departure Dates List */}
            <div className="space-y-3 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
            {/* Price Comparison Graph */}
            <div className="mb-12">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="w-full aspect-video bg-gray-200 rounded-lg animate-pulse" />
            </div>
        </div>
    )
}

export function TourDetailsFooterSkeleton() {
    return (
        <div className="space-y-10 lg:space-y-16">
            {/* Brochure Banner Skeleton */}
            <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />

            {/* Reviews Section Skeleton */}
            <div className="py-4 border-t border-gray-200">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="h-4 w-96 max-w-full bg-gray-200 rounded animate-pulse mb-6" />

                {/* Overall Rating Box */}
                <div className="flex items-center p-6 bg-gray-100 rounded-lg max-w-lg mb-8 animate-pulse">
                    <div className="mr-6 text-center">
                        <div className="h-12 w-16 bg-gray-300 rounded mb-2" />
                        <div className="h-4 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="flex-grow space-y-2">
                        <div className="h-3 w-full bg-gray-300 rounded" />
                        <div className="h-3 w-full bg-gray-300 rounded" />
                        <div className="h-3 w-full bg-gray-300 rounded" />
                    </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-b border-gray-100 pb-8 animate-pulse">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                                    <div>
                                        <div className="h-4 w-32 bg-gray-300 rounded mb-1" />
                                        <div className="h-3 w-24 bg-gray-300 rounded" />
                                    </div>
                                </div>
                                <div className="h-3 w-20 bg-gray-300 rounded" />
                            </div>
                            <div className="pl-11 space-y-2">
                                <div className="h-4 w-32 bg-gray-300 rounded" />
                                <div className="h-3 w-full bg-gray-300 rounded" />
                                <div className="h-3 w-5/6 bg-gray-300 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
