"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp, Star, Check, Calendar, Users, Clock, Tag, Filter, X } from "lucide-react"
import FavoriteButton from "@/components/FavoriteButton"
import BrochureDialog from "@/components/BrochureDialog"
import { useGetPackagesQuery, useGetPackageFiltersQuery } from "@/lib/api/packagesApi"

// Types
interface Tour {
    id: number
    title: string
    description: string | null
    image: string | null
    mapImage: string | null
    galleryImages: string[]
    rating: number
    reviewCount: number
    isCustomizable: boolean
    bestPrice: boolean
    tags: string[]
    tourType: string | null
    accommodation: string | null
    ageRange: string | null
    destinations: string[]
    duration: string
    price: number
    originalPrice: number | null
    saving: number
    discountPercent: number | null
    upcomingDepartures: Array<{ date: string; seatsRemaining: number | null }>
    departureType: string | null
    itineraryPdf: string | null
    destination: {
        name: string
        country: string | null
    }
}

interface PackagesResponse {
    packages: Tour[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

function ToursContent() {
    const searchParams = useSearchParams()
    const destinationId = searchParams.get("destinationId") || ""
    const budgetType = searchParams.get("type") // domestic or international
    const country = budgetType === "domestic" ? "India" : (searchParams.get("country") || "")
    const region = searchParams.get("region") || ""
    const excludeCountry = budgetType === "international" ? "India" : null
    const saleSlug = searchParams.get("saleSlug")
    const initialTourType = searchParams.get("tourType") || ""
    const initialMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null
    const initialSortBy = searchParams.get("sortBy") || "popular"
    const initialDuration = searchParams.get("duration") || ""
    const searchQuery = searchParams.get("search") || ""

    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState(initialSortBy)
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

    // Brochure dialog state
    const [brochureDialog, setBrochureDialog] = useState<{
        isOpen: boolean
        packageId: number
        packageName: string
        brochureUrl: string | null
    }>({ isOpen: false, packageId: 0, packageName: "", brochureUrl: null })

    // Filter states
    const [priceRange, setPriceRange] = useState(initialMaxPrice ? [0, initialMaxPrice] : [0, 500000])
    const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(initialMaxPrice || 500000)
    const [initialApiMax, setInitialApiMax] = useState<number | null>(null) // Track the API's max to detect user changes
    const [selectedDurations, setSelectedDurations] = useState<string[]>(initialDuration ? [initialDuration] : [])
    const [selectedDepartureTypes, setSelectedDepartureTypes] = useState<string[]>([])
    const [selectedTourTypes, setSelectedTourTypes] = useState<string[]>(initialTourType ? [initialTourType] : [])
    const [selectedDiscountDeals, setSelectedDiscountDeals] = useState<string[]>([])

    // Collapsible sections
    const [openSections, setOpenSections] = useState({
        pricing: true,
        duration: true,
        departureType: true,
        tourType: true,
        discountDeals: true,
    })

    // RTK Query hooks
    const filterParams = useMemo(() => ({
        country: country || undefined,
        region: region || undefined,
    }), [country, region])

    const { data: filterOptions, isLoading: filtersLoading } = useGetPackageFiltersQuery(filterParams)

    // Build package query params
    const packageQueryParams = useMemo(() => {
        const params: Record<string, string | number | undefined> = {
            page: currentPage,
            limit: 10,
            sortBy,
        }
        // Prioritize destinationId over country/region
        if (destinationId) {
            params.destinationId = Number(destinationId)
        } else {
            // Only set country if we are NOT in international mode (where we want everything EXCEPT India)
            if (country && !excludeCountry) params.country = country
            if (region) params.region = region
        }
        if (excludeCountry) params.excludeCountry = excludeCountry
        if (saleSlug) params.saleSlug = saleSlug
        if (selectedDurations.length === 1) params.duration = selectedDurations[0]
        // Send maxPrice if user has moved the slider below the initial max
        if (initialApiMax !== null && debouncedMaxPrice < initialApiMax) {
            params.maxPrice = debouncedMaxPrice
        }
        if (selectedTourTypes.length === 1) params.tourType = selectedTourTypes[0]
        if (selectedDepartureTypes.length === 1) params.departureType = selectedDepartureTypes[0]
        if (searchQuery) params.search = searchQuery
        return params
    }, [destinationId, country, region, excludeCountry, saleSlug, currentPage, sortBy, debouncedMaxPrice, selectedTourTypes, selectedDurations, selectedDepartureTypes, initialApiMax, searchQuery])

    const { data: packagesData, isLoading: loading } = useGetPackagesQuery(packageQueryParams)

    // Extract tours and pagination from response
    const tours = useMemo(() => {
        if (!packagesData) return []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = packagesData as any
        if (data.packages) {
            return data.packages
        }
        return Array.isArray(packagesData) ? packagesData : []
    }, [packagesData]) as Tour[]

    const pagination = useMemo(() => {
        if (!packagesData) return null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = packagesData as any
        if (data.pagination) {
            return data.pagination
        }
        return null
    }, [packagesData])

    // Initialize price range once when filter options first load
    useEffect(() => {
        if (filterOptions && initialApiMax === null) {
            const apiMax = Number(filterOptions.priceRange.max) || 500000
            const apiMin = Number(filterOptions.priceRange.min) || 0
            setInitialApiMax(apiMax)
            if (!initialMaxPrice) {
                setPriceRange([apiMin, apiMax])
                setDebouncedMaxPrice(apiMax)
            }
        }
    }, [filterOptions, initialApiMax, initialMaxPrice])

    // Debounce price slider — only trigger API call after user stops dragging
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMaxPrice(priceRange[1])
        }, 400)
        return () => clearTimeout(timer)
    }, [priceRange])

    // Reset to page 1 whenever any filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedMaxPrice, selectedDurations, selectedDepartureTypes, selectedTourTypes, selectedDiscountDeals, sortBy])

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    const toggleFilter = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((v) => v !== value))
        } else {
            setSelected([...selected, value])
        }
    }

    const clearAllFilters = () => {
        if (filterOptions && initialApiMax !== null) {
            setPriceRange([Number(filterOptions.priceRange.min) || 0, initialApiMax])
            setDebouncedMaxPrice(initialApiMax) // Apply immediately without debounce delay
        }
        setSelectedDurations([])
        setSelectedDepartureTypes([])
        setSelectedTourTypes([])
        setSelectedDiscountDeals([])
    }

    const isPriceFiltered = initialApiMax !== null && debouncedMaxPrice < initialApiMax
    const activeFilterCount = selectedDurations.length + selectedDepartureTypes.length + selectedTourTypes.length + selectedDiscountDeals.length + (isPriceFiltered ? 1 : 0)

    // Calculate total reviews
    const totalReviews = tours.reduce((sum, tour) => sum + (tour.reviewCount || 0), 0)

    const displayTitle = country || region || (searchQuery ? `"${searchQuery}"` : "World")

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        {displayTitle} Travel Deals
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm md:text-base">
                        Find the best prices on travel deals in {displayTitle}. Explore discounted tours and vacation packages, rated by travelers.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Left Sidebar - Filters */}
                    <aside className={`
                            fixed lg:relative inset-0 z-50 lg:z-auto
                            ${isMobileFilterOpen ? 'block' : 'hidden'} lg:block
                            w-full lg:w-64 lg:shrink-0
                        `}>
                        {/* Mobile overlay */}
                        <div
                            className="absolute inset-0 bg-black/50 lg:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />

                        {/* Filter content */}
                        <div className="relative bg-white lg:bg-transparent w-80 lg:w-full h-full lg:h-auto overflow-y-auto lg:overflow-visible p-4 lg:p-0">
                            {/* Mobile header */}
                            <div className="flex items-center justify-between mb-4 lg:hidden">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Clear filters */}
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-primary text-sm font-medium mb-4 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}

                            <div className="space-y-4">
                                {/* Pricing Filter */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('pricing')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag size={18} className="text-gray-500" />
                                            <span className="font-medium text-gray-900">Pricing</span>
                                        </div>
                                        {openSections.pricing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {openSections.pricing && filterOptions && initialApiMax !== null && (
                                        <div className="px-4 pb-4 space-y-4">
                                            <div>
                                                <input
                                                    type="range"
                                                    min={Number(filterOptions.priceRange.min) || 0}
                                                    max={initialApiMax}
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                                    className="w-full accent-primary"
                                                />
                                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                                    <span>₹{(Number(filterOptions.priceRange.min) || 0).toLocaleString("en-IN")}</span>
                                                    <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Duration Filter */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('duration')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock size={18} className="text-gray-500" />
                                            <span className="font-medium text-gray-900">Duration</span>
                                        </div>
                                        {openSections.duration ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {openSections.duration && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {filtersLoading ? (
                                                <div className="text-sm text-gray-400">Loading...</div>
                                            ) : filterOptions?.durationRanges && filterOptions.durationRanges.length > 0 ? (
                                                filterOptions.durationRanges.map((option: string) => (
                                                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDurations.includes(option)}
                                                            onChange={() => toggleFilter(option, selectedDurations, setSelectedDurations)}
                                                            className="w-4 h-4 accent-primary rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400">No options available</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Departure Type Filter */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('departureType')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Calendar size={18} className="text-gray-500" />
                                            <span className="font-medium text-gray-900">Departure Type</span>
                                        </div>
                                        {openSections.departureType ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {openSections.departureType && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {filtersLoading ? (
                                                <div className="text-sm text-gray-400">Loading...</div>
                                            ) : filterOptions?.departureTypes && filterOptions.departureTypes.length > 0 ? (
                                                filterOptions.departureTypes.map((option: string) => (
                                                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDepartureTypes.includes(option)}
                                                            onChange={() => toggleFilter(option, selectedDepartureTypes, setSelectedDepartureTypes)}
                                                            className="w-4 h-4 accent-primary rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400">No options available</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tour Type Filter */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('tourType')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users size={18} className="text-gray-500" />
                                            <span className="font-medium text-gray-900">Tour Type</span>
                                        </div>
                                        {openSections.tourType ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {openSections.tourType && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {filtersLoading ? (
                                                <div className="text-sm text-gray-400">Loading...</div>
                                            ) : filterOptions?.tourTypes && filterOptions.tourTypes.length > 0 ? (
                                                filterOptions.tourTypes.map((option: string) => (
                                                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTourTypes.includes(option)}
                                                            onChange={() => toggleFilter(option, selectedTourTypes, setSelectedTourTypes)}
                                                            className="w-4 h-4 accent-primary rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400">No options available</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Discount Deals Filter */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('discountDeals')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag size={18} className="text-gray-500" />
                                            <span className="font-medium text-gray-900">Discount Deals</span>
                                        </div>
                                        {openSections.discountDeals ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {openSections.discountDeals && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {filtersLoading ? (
                                                <div className="text-sm text-gray-400">Loading...</div>
                                            ) : filterOptions?.discountDeals && filterOptions.discountDeals.length > 0 ? (
                                                filterOptions.discountDeals.map((option: string) => (
                                                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDiscountDeals.includes(option)}
                                                            onChange={() => toggleFilter(option, selectedDiscountDeals, setSelectedDiscountDeals)}
                                                            className="w-4 h-4 accent-primary rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400">No options available</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile apply button */}
                            <div className="mt-4 lg:hidden">
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-full py-3 bg-primary text-white font-semibold rounded-lg"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-gray-900">
                                    <span className="font-semibold">{pagination?.total || tours.length} Travel Deals Trips in {country}</span>
                                    <span className="text-gray-600"> with </span>
                                    <span className="text-primary font-medium">{totalReviews.toLocaleString()} Reviews</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="duration">Duration</option>
                                </select>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                                        <div className="flex flex-col lg:flex-row gap-4">
                                            <div className="lg:w-60 shrink-0">
                                                <div className="aspect-4/3 bg-gray-200 rounded-lg"></div>
                                                <div className="aspect-video bg-gray-200 rounded-lg mt-2"></div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && tours.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg mb-4">
                                    {country ? `No tours available for ${country} yet.` : "No tours available matching your criteria."}
                                </p>
                                <Link href="/destinations" className="text-primary font-medium hover:underline">
                                    Browse all destinations
                                </Link>
                            </div>
                        )}

                        {/* Tour Cards */}
                        {!loading && tours.length > 0 && (
                            <div className="space-y-6">
                                {tours.map((tour) => (
                                    <div
                                        key={tour.id}
                                        className="bg-white relative rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            {/* Image Section - Two stacked images */}
                                            <div className="relative lg:w-60 p-2 shrink-0">
                                                {/* Wishlist button */}
                                                <FavoriteButton
                                                    packageId={tour.id}
                                                    size="md"
                                                    className="absolute top-4 right-4 z-20"
                                                />
                                                {/* Main Tour Image - 4:3 aspect ratio */}
                                                <div className="relative aspect-4/3 w-full rounded overflow-hidden">
                                                    <Image
                                                        src={tour.image || "/placeholder.jpg"}
                                                        alt={tour.title}
                                                        fill
                                                        sizes="(max-width: 1024px) 100vw, 240px"
                                                        loading="lazy"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                {/* Map Image - 16:9 aspect ratio */}
                                                <div className="relative aspect-video mt-2 rounded overflow-hidden w-full bg-gray-100">
                                                    <Image
                                                        src={tour.galleryImages?.[1] || tour.mapImage || tour.image || "/placeholder.jpg"}
                                                        alt={`${tour.title} secondary`}
                                                        fill
                                                        sizes="(max-width: 1024px) 100vw, 240px"
                                                        loading="lazy"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 p-2 lg:p-4">
                                                <div className="flex flex-col lg:flex-row gap-4">
                                                    {/* Left content */}
                                                    <div className="flex-1">
                                                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">
                                                            <Link href={`/destinations/trip/${tour.id}`}>
                                                                {tour.title}
                                                            </Link>
                                                        </h3>

                                                        {/* Rating and features */}
                                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                                            <div className="flex items-center gap-1">
                                                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                                <span className="font-medium text-gray-900">{tour.rating?.toFixed(1) || "0.0"}</span>
                                                                <span className="text-gray-500 text-sm">({tour.reviewCount || 0} reviews)</span>
                                                            </div>
                                                            {tour.isCustomizable && (
                                                                <div className="flex items-center gap-1 text-sm text-primary">
                                                                    <Check size={14} />
                                                                    <span>Trip customizable</span>
                                                                </div>
                                                            )}
                                                            {tour.bestPrice && (
                                                                <div className="flex items-center gap-1 text-sm text-primary">
                                                                    <Check size={14} />
                                                                    <span>Best price guaranteed</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 italic">
                                                            {tour.description || "Discover an unforgettable journey with our expertly curated tour package."}
                                                        </p>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {(tour.tags || []).slice(0, 2).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {(tour.tags || []).length > 2 && (
                                                                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                                                                    +{tour.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Tour details grid */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm">
                                                            <div className="flex">
                                                                <span className="text-gray-500 w-24 sm:w-28 shrink-0">Tour Type</span>
                                                                <span className="text-gray-900 line-clamp-1">{tour.tourType || "Private Tour"}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="text-gray-500 w-24 sm:w-28 shrink-0">Accommodation</span>
                                                                <span className="text-gray-900 truncate">{tour.accommodation || "Hotel"}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="text-gray-500 w-24 sm:w-28 shrink-0">Age Range</span>
                                                                <span className="text-gray-900">{tour.ageRange || "1-80 yrs"}</span>
                                                            </div>
                                                            <div className="flex sm:col-span-2">
                                                                <span className="text-gray-500 w-24 sm:w-28 shrink-0">Destinations</span>
                                                                <span className="text-primary truncate">
                                                                    {(tour.destinations || []).slice(0, 3).join(", ")}
                                                                    {(tour.destinations || []).length > 3 && (
                                                                        <span className="text-primary"> +{tour.destinations.length - 3} more</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right side - Pricing */}
                                                    <div className="lg:w-60 shrink-0 pt-2 lg:pt-0">
                                                        {/* Duration and price */}
                                                        <div className="flex justify-between">
                                                            <div className="text-right mb-3">
                                                                <p className="text-gray-500 text-sm">Duration</p>
                                                                <p className="font-semibold text-gray-900">{tour.duration}</p>
                                                            </div>
                                                            <div className="text-right mb-3">
                                                                {tour.originalPrice && tour.originalPrice > tour.price && (
                                                                    <p className="text-gray-400 text-sm line-through">
                                                                        From ₹{tour.originalPrice.toLocaleString("en-IN")}
                                                                    </p>
                                                                )}
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                    ₹{tour.price?.toLocaleString("en-IN")}
                                                                </p>
                                                                {tour.saving && tour.saving > 0 ? (
                                                                    <p className="text-sm text-primary">
                                                                        Saving ₹{tour.saving.toLocaleString("en-IN")} 🏷️
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        {/* CTA buttons */}
                                                        <div className="space-y-2">
                                                            <Link
                                                                href={`/destinations/trip/${tour.id}`}
                                                                className="block w-full py-2.5 bg-primary text-white text-center font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                                                            >
                                                                View Tour
                                                            </Link>
                                                            <button
                                                                onClick={() => setBrochureDialog({
                                                                    isOpen: true,
                                                                    packageId: tour.id,
                                                                    packageName: tour.title,
                                                                    brochureUrl: tour.itineraryPdf
                                                                })}
                                                                className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                            >
                                                                Get Trip Brochure
                                                            </button>
                                                        </div>

                                                        {/* Upcoming departures */}
                                                        {(tour.upcomingDepartures || []).length > 0 && (
                                                            <div className="mt-4">
                                                                <p className="text-xs text-gray-500 mb-2">Upcoming Departures</p>
                                                                <div className="space-y-1">
                                                                    {tour.upcomingDepartures.slice(0, 2).map((dep, i) => (
                                                                        <div key={i} className="flex items-center justify-between text-sm">
                                                                            <div className="flex items-center gap-1">
                                                                                <Check size={14} className="text-primary" />
                                                                                <span className="text-gray-700">{dep.date}</span>
                                                                            </div>
                                                                            {dep.seatsRemaining && (
                                                                                <span className="text-xs text-gray-500">
                                                                                    {dep.seatsRemaining} seats remaining
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Dynamic discount badge */}
                                        {(tour.discountPercent || 0) > 0 && (
                                            <div className="absolute -top-4 right-4">
                                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    {tour.discountPercent}% OFF TODAY
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <nav className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        const page = i + 1
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-lg ${currentPage === page
                                                    ? "bg-primary text-white"
                                                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    })}
                                    {pagination.totalPages > 5 && (
                                        <>
                                            <span className="px-2 text-gray-500">...</span>
                                            <button
                                                onClick={() => setCurrentPage(pagination.totalPages)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                            >
                                                {pagination.totalPages}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Brochure Dialog */}
            <BrochureDialog
                isOpen={brochureDialog.isOpen}
                onClose={() => setBrochureDialog(prev => ({ ...prev, isOpen: false }))}
                packageId={brochureDialog.packageId}
                packageName={brochureDialog.packageName}
                brochureUrl={brochureDialog.brochureUrl}
            />
        </main>
    )
}

export default function ToursPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <ToursContent />
        </Suspense>
    )
}