import { api } from "./apiSlice"

interface Sale {
    id: number
    name: string
    slug: string
    description: string | null
    heroImage: string | null
    isActive: boolean
    packages: Array<{
        id: number
        title: string
        price: number
        originalPrice: number | null
        duration: string
        image: string | null
        rating: number
        destination: {
            name: string
        }
    }>
}

interface FeatureBox {
    id: number
    title: string
    description: string | null
    icon: string
    order: number
    isActive: boolean
}

interface Expert {
    id: number
    name: string
    email: string | null
    avatar: string | null
    bio: string | null
    expertise: string[]
    whatsappNumber: string | null
    type: string
    isActive: boolean
}

export const publicApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Sales
        getActiveSales: builder.query<Sale[], void>({
            query: () => "/sales/active",
            providesTags: ["Sale"],
        }),
        getSaleBySlug: builder.query<Sale, string>({
            query: (slug) => `/sales/${slug}`,
            providesTags: ["Sale"],
        }),

        // Feature Boxes
        getFeatureBoxes: builder.query<FeatureBox[], void>({
            query: () => "/feature-boxes",
            providesTags: ["FeatureBox"],
        }),

        // Experts
        getExperts: builder.query<Expert[], string | void>({
            query: (type) => type ? `/admin/experts?type=${type}` : "/admin/experts",
            providesTags: ["Expert"],
        }),

        // Enquiry
        submitEnquiry: builder.mutation<{ success: boolean }, {
            name: string
            email: string
            phone: string
            packageId?: number
            packageName?: string
            preferredDate?: string
            numberOfTravelers?: string
            message?: string
        }>({
            query: (data) => ({
                url: "/enquiry",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Enquiry"],
        }),

        // Brochure Request
        requestBrochure: builder.mutation<{ couponCode: string }, {
            name?: string
            email: string
            phone?: string
            packageId?: number
            packageName?: string
        }>({
            query: (data) => ({
                url: "/brochure-request",
                method: "POST",
                body: data,
            }),
        }),

        // Trip Planner
        submitTripPlan: builder.mutation<{ success: boolean }, Record<string, unknown>>({
            query: (data) => ({
                url: "/trip-planner/submit",
                method: "POST",
                body: data,
            }),
        }),
    }),
})

export const {
    useGetActiveSalesQuery,
    useGetSaleBySlugQuery,
    useGetFeatureBoxesQuery,
    useGetExpertsQuery,
    useSubmitEnquiryMutation,
    useRequestBrochureMutation,
    useSubmitTripPlanMutation,
} = publicApi
