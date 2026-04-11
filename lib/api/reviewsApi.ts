import { api } from "./apiSlice"

interface VideoReview {
    id: number
    video: string
    name: string
    destination: string
}

interface PhotoReview {
    id: string | number
    image: string
    title: string
    name: string
}

interface Review {
    id: number
    userId: number
    packageId: number
    rating: number
    comment: string | null
    designation: string | null
    avatar: string | null
    image: string | null
    images: string | null
    video: string | null
    destination: string | null
    createdAt: string
    user: {
        id: number
        name: string
    }
    package: {
        id: number
        title: string
        destination: {
            name: string
        }
    }
}

export const reviewsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query<Review[], void>({
            query: () => "/reviews",
            providesTags: ["Review"],
        }),
        getVideoReviews: builder.query<VideoReview[], number | void>({
            query: (limit) => `/reviews?type=video${limit ? `&limit=${limit}` : ""}`,
            providesTags: ["Review"],
        }),
        getPhotoReviews: builder.query<PhotoReview[], number | void>({
            query: (limit) => `/reviews?type=photo${limit ? `&limit=${limit}` : ""}`,
            providesTags: ["Review"],
        }),
        getReview: builder.query<Review, number>({
            query: (id) => `/reviews/${id}`,
            providesTags: ["Review"],
        }),
        createReview: builder.mutation<Review, { packageId: number; rating: number; comment: string; images?: string[]; video?: string; bookingRef?: string }>({
            query: (data) => ({
                url: "/reviews",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Review", "Booking"],
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetReviewsQuery,
    useGetVideoReviewsQuery,
    useGetPhotoReviewsQuery,
    useGetReviewQuery,
    useCreateReviewMutation,
} = reviewsApi
