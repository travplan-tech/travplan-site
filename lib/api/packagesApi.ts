import { api } from "./apiSlice"

interface Package {
    id: number
    title: string
    description: string | null
    destinationId: number
    price: number
    originalPrice: number | null
    duration: string
    rating: number
    image: string | null
    mapImage: string | null
    galleryImages: string[]
    highlights: string[]
    cities: string | null
    tourType: string | null
    tourCategory: string | null
    maxPersons: number | null
    ageRange: string | null
    accommodation: string | null
    departurePoints: string[]
    departureDates: string | null
    itinerary: Array<{
        day: number
        title: string
        description: string
        duration?: string
        altitude?: string
    }>
    itineraryPdf: string | null
    inclusions: string[]
    exclusions: string[]
    cancellationPolicy: string | null
    specialNotes: string | null
    priceChartImage: string | null
    isCustomizable: boolean
    bestPrice: boolean
    flightsIncluded: boolean
    tags: string | null
    discountPercent: number | null
    destination: {
        id: number
        name: string
        country: string | null
    }
    reviews?: Array<{
        id: number
        rating: number
        comment: string | null
        user: {
            name: string | null
            image: string | null
        }
        createdAt: string
    }>
    upcomingDepartures?: Array<{
        date: string
        seatsRemaining?: number | null
        price?: number
    }>
    reviewCount?: number
}

interface PackageFilters {
    destinationId?: number
    country?: string
    region?: string
    saleSlug?: string
    excludeCountry?: string
    tourType?: string
    tourCategory?: string
    departureType?: string
    minPrice?: number
    maxPrice?: number
    duration?: string
    sortBy?: string
    limit?: number
    offset?: number
    search?: string
}

interface BudgetStats {
    budget: Array<{ range: string; count: number }>
}

interface TourTypeStats {
    tourTypes: Array<{ type: string; count: number }>
}

interface FilterOptions {
    countries: string[]
    tourTypes: string[]
    departureTypes: string[]
    durationRanges: string[]
    discountDeals: string[]
    tags: string[]
    priceRange: { min: number; max: number }
}

interface FilterQueryParams {
    destinationId?: number
    country?: string
    region?: string
    saleSlug?: string
    tourCategory?: string
    excludeCountry?: string
}

interface CreatePackageRequest extends Partial<Package> {
    roomConfig?: Record<number, { quantity: number; price: number }>
}

export const packagesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPackages: builder.query<Package[], PackageFilters | void>({
            query: (filters) => {
                if (!filters) return "/packages"
                const params = new URLSearchParams()
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, String(value))
                    }
                })
                return `/packages?${params.toString()}`
            },
            providesTags: ["Package"],
        }),
        getPackagesByDestination: builder.query<Package[], number>({
            query: (destinationId) => `/packages?destinationId=${destinationId}`,
            providesTags: ["Package"],
        }),
        getPackage: builder.query<Package, number | string>({
            query: (id) => `/packages/${id}`,
            providesTags: ["Package"],
        }),
        createPackage: builder.mutation<Package, CreatePackageRequest>({
            query: (pkg) => ({
                url: "/packages",
                method: "POST",
                body: pkg,
            }),
            invalidatesTags: ["Package"],
        }),
        updatePackage: builder.mutation<Package, { id: number; data: Partial<Package> }>({
            query: ({ id, data }) => ({
                url: `/packages/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Package"],
        }),
        deletePackage: builder.mutation<void, number>({
            query: (id) => ({
                url: `/packages/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Package"],
        }),
        getBudgetStats: builder.query<BudgetStats, void>({
            query: () => "/packages/budget-stats",
            providesTags: ["Package"],
        }),
        getTourTypeStats: builder.query<TourTypeStats, FilterQueryParams | void>({
            query: (params) => {
                if (!params) return "/packages/tour-type-stats"
                const searchParams = new URLSearchParams()
                if (params.destinationId) searchParams.set("destinationId", String(params.destinationId))
                if (params.country) searchParams.set("country", params.country)
                if (params.region) searchParams.set("region", params.region)
                if (params.saleSlug) searchParams.set("saleSlug", params.saleSlug)
                if (params.tourCategory) searchParams.set("tourCategory", params.tourCategory)
                if (params.excludeCountry) searchParams.set("excludeCountry", params.excludeCountry)
                return `/packages/tour-type-stats?${searchParams.toString()}`
            },
            providesTags: ["Package"],
        }),
        getPackageFilters: builder.query<FilterOptions, FilterQueryParams | void>({
            query: (params) => {
                if (!params) return "/packages/filters"
                const searchParams = new URLSearchParams()
                if (params.country) searchParams.set("country", params.country)
                if (params.region) searchParams.set("region", params.region)
                return `/packages/filters?${searchParams.toString()}`
            },
            providesTags: ["Package"],
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetPackagesQuery,
    useGetPackagesByDestinationQuery,
    useGetPackageQuery,
    useCreatePackageMutation,
    useUpdatePackageMutation,
    useDeletePackageMutation,
    useGetBudgetStatsQuery,
    useGetTourTypeStatsQuery,
    useGetPackageFiltersQuery,
} = packagesApi
