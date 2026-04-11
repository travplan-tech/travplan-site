import { api } from "./apiSlice"

interface UserProfile {
    id: number
    email: string
    name: string | null
    phone: string | null
    image: string | null
    role: string
}

interface FavoritePackage {
    id: number
    title: string
    image: string | null
    price: number
    originalPrice: number | null
    duration: string
    rating: number
    tourType: string | null
    tourCategory: string | null
    destination: {
        name: string
        country: string | null
    }
}

interface Favorite {
    id: number
    userId: number
    packageId: number
    createdAt: string
    package: FavoritePackage
}

interface UserBooking {
    id: number
    bookingRef: string
    guestName: string
    guestEmail: string
    guestPhone: string
    numberOfPeople: number
    travelerNames: string | null
    selectedDate: string
    departureCity: string
    specialRequests: string | null
    pricePerPerson: number
    totalPrice: number
    discountAmount: number | null
    couponCode: string | null
    roomSelection: string | any | null
    roomTotalPrice: number | null
    status: string
    paymentStatus: string
    createdAt: string
    package: {
        id: number
        title: string
        image: string | null
        duration: string
        destination: {
            name: string
        }
    } | null
}

interface BookingDetails extends UserBooking {
    paymentId: string | null
    orderId: string | null
    updatedAt: string
}

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // User Profile
        getUserProfile: builder.query<UserProfile, void>({
            query: () => "/user/profile",
            providesTags: ["User"],
        }),
        updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
            query: (data) => ({
                url: "/user/profile",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),

        // User Bookings
        getUserBookings: builder.query<UserBooking[], void>({
            query: () => "/user/bookings",
            providesTags: ["Booking"],
        }),
        getBookingByRef: builder.query<BookingDetails, string>({
            query: (ref) => `/bookings/${ref}`,
            providesTags: ["Booking"],
        }),

        // Create Booking
        createBooking: builder.mutation<{ id: number; bookingRef: string; orderId: string }, Record<string, unknown>>({
            query: (data) => ({
                url: "/bookings",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Booking"],
        }),

        // Coupons
        applyCoupon: builder.mutation<
            { valid: boolean; code: string; discountType: string; discountValue: number; discountAmount: number; message?: string },
            { code: string; packageId?: number }
        >({
            query: (data) => ({
                url: "/coupons/apply",
                method: "POST",
                body: data,
            }),
        }),

        // Payment
        createPaymentOrder: builder.mutation<
            { id: string; orderId: string; amount: number; currency: string; key: string },
            { bookingId: number }
        >({
            query: (data) => ({
                url: "/payment/create-order",
                method: "POST",
                body: data,
            }),
        }),
        verifyPayment: builder.mutation<
            { success: boolean; bookingRef: string },
            { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; bookingId: number }
        >({
            query: (data) => ({
                url: "/payment/verify",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Booking"],
        }),

        // Favorites
        getUserFavorites: builder.query<Favorite[], void>({
            query: () => "/user/favorites",
            providesTags: [{ type: "Favorite", id: "LIST" }],
        }),
        checkFavorite: builder.query<{ favorited: boolean }, number>({
            query: (packageId) => `/user/favorites/check?packageId=${packageId}`,
            providesTags: (_result, _error, packageId) => [{ type: "Favorite" as const, id: packageId }],
        }),
        toggleFavorite: builder.mutation<{ favorited: boolean; message: string }, number>({
            query: (packageId) => ({
                url: "/user/favorites",
                method: "POST",
                body: { packageId },
            }),
            // Optimistic update: immediately toggle the checkFavorite cache for this package
            async onQueryStarted(packageId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    userApi.util.updateQueryData("checkFavorite", packageId, (draft) => {
                        draft.favorited = !draft.favorited
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },
            // Only invalidate the favorites list (for profile page), not every checkFavorite cache entry
            invalidatesTags: [{ type: "Favorite", id: "LIST" }],
        }),
    }),
})

export const {
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGetUserBookingsQuery,
    useGetBookingByRefQuery,
    useCreateBookingMutation,
    useApplyCouponMutation,
    useCreatePaymentOrderMutation,
    useVerifyPaymentMutation,
    useGetUserFavoritesQuery,
    useCheckFavoriteQuery,
    useToggleFavoriteMutation,
} = userApi
