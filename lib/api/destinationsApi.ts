import { api } from "./apiSlice"

interface Destination {
    id: number
    name: string
    description: string | null
    country: string | null
    city: string | null
    region: string | null
    image: string | null
    rating: number
    popularity: number
    tours: number
}

interface DestinationsByRegion {
    [region: string]: Destination[]
}

export const destinationsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDestinations: builder.query<Destination[], Record<string, string | boolean | undefined> | void>({
            query: (params) => {
                if (!params) return "/destinations"
                const searchParams = new URLSearchParams()
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        searchParams.set(key, String(value))
                    }
                })
                return `/destinations?${searchParams.toString()}`
            },
            providesTags: ["Destination"],
        }),
        getDestinationsByRegion: builder.query<DestinationsByRegion, void>({
            query: () => "/destinations?groupByRegion=true",
            providesTags: ["Destination"],
        }),
        getDestinationsByCountry: builder.query<Destination[], string>({
            query: (country) => `/destinations?country=${encodeURIComponent(country)}`,
            providesTags: ["Destination"],
        }),
        getDestination: builder.query<Destination, number>({
            query: (id) => `/destinations/${id}`,
            providesTags: ["Destination"],
        }),
        createDestination: builder.mutation<Destination, Partial<Destination>>({
            query: (destination) => ({
                url: "/destinations",
                method: "POST",
                body: destination,
            }),
            invalidatesTags: ["Destination"],
        }),
        updateDestination: builder.mutation<Destination, { id: number; data: Partial<Destination> }>({
            query: ({ id, data }) => ({
                url: `/destinations/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Destination"],
        }),
        deleteDestination: builder.mutation<void, number>({
            query: (id) => ({
                url: `/destinations/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Destination"],
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetDestinationsQuery,
    useGetDestinationsByRegionQuery,
    useGetDestinationsByCountryQuery,
    useGetDestinationQuery,
    useCreateDestinationMutation,
    useUpdateDestinationMutation,
    useDeleteDestinationMutation,
} = destinationsApi
