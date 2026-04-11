import { api } from "./apiSlice"

// Types for Admin APIs
interface AdminReview {
    id: number
    rating: number
    comment: string
    designation: string | null
    avatar: string | null
    image: string | null
    images: string | null
    video: string | null
    createdAt: string
    user: {
        id: number
        name: string
        email: string
    }
    package: {
        id: number
        title: string
        destination: {
            name: string
        }
    }
}

interface AdminBooking {
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
    status: string
    paymentStatus: string
    paymentId: string | null
    orderId: string | null
    createdAt: string
    updatedAt: string
    user: {
        id: number
        name: string
        email: string
    }
    package: {
        id: number
        title: string
        destination: {
            name: string
        }
    } | null
}

interface AdminUser {
    id: number
    email: string
    name: string | null
    phone: string | null
    role: string
    image: string | null
    createdAt: string
    _count: {
        bookings: number
        reviews: number
    }
}

interface AdminDestination {
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
    _count?: {
        packages: number
    }
}

interface AdminPackage {
    id: number
    title: string
    description: string | null
    destinationId: number
    destination: {
        id: number
        name: string
    }
    price: number
    originalPrice: number | null
    duration: string
    rating: number
    image: string | null
    tourType: string | null
    tourCategory: string | null
    isCustomizable: boolean
    bestPrice: boolean
    flightsIncluded: boolean
    createdAt: string
}

interface RoomAvailabilityData {
    id: number
    roomType: number
    totalRooms: number
    availableRooms: number
    pricePerRoom: number
}

interface AdminTourDate {
    id: number
    packageId: number
    startDate: string
    endDate: string
    dateLabel: string
    price: number | null
    totalSeats: number
    availableSeats: number
    isActive: boolean
    roomAvailability: RoomAvailabilityData[]
    createdAt: string
    updatedAt: string
}

interface RoomConfigInput {
    roomType: number
    totalRooms: number
    pricePerRoom: number
}

interface AdminTourDateInput {
    packageId: number
    startDate: string
    endDate: string
    dateLabel: string
    price?: number | null
    totalSeats: number
    isActive?: boolean
    roomConfig?: RoomConfigInput[]
}

interface AdminEnquiry {
    id: number
    name: string
    email: string
    phone: string
    packageId: number | null
    packageName: string | null
    preferredDate: string | null
    numberOfTravelers: string | null
    message: string | null
    status: string
    createdAt: string
}

interface AdminContact {
    id: number
    fullName: string
    email: string
    phone: string
    message: string
    status: string
    createdAt: string
}

interface AdminNewsletter {
    id: number
    email: string
    createdAt: string
}

interface AdminExpert {
    id: number
    name: string
    email: string | null
    avatar: string | null
    bio: string | null
    expertise: string[]
    whatsappNumber: string | null
    type: string
    isActive: boolean
    order: number
}

interface AdminSale {
    id: number
    name: string
    slug: string
    description: string | null
    heroImage: string | null
    isActive: boolean
    packages: AdminPackage[]
    createdAt: string
}

interface FeatureBox {
    id: number
    title: string
    description: string | null
    icon: string
    order: number
    isActive: boolean
}

interface RecentActivityItem {
    id: number
    type: "booking"
    title: string
    subtitle: string
    amount: number
    status: string
    createdAt: string
}

interface AdminStats {
    totalBookings: number
    totalRevenue: number
    totalUsers: number
    totalPackages: number
    totalDestinations: number
    recentBookings: number
    monthlyGrowth: number
    pendingBookings: number
    recentActivity: RecentActivityItem[]
}

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Stats
        getAdminStats: builder.query<AdminStats, void>({
            query: () => "/admin/stats",
            providesTags: ["Stats"],
        }),

        // Reviews
        getAdminReviews: builder.query<AdminReview[], void>({
            query: () => "/admin/reviews",
            providesTags: ["Review"],
        }),
        createAdminReview: builder.mutation<AdminReview, Partial<AdminReview> & { userName: string; packageId: number }>({
            query: (data) => ({
                url: "/admin/reviews",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Review"],
        }),
        updateAdminReview: builder.mutation<AdminReview, { id: number; data: Partial<AdminReview> }>({
            query: ({ id, data }) => ({
                url: `/admin/reviews/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Review"],
        }),
        deleteAdminReview: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/reviews/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Review"],
        }),

        // Bookings
        getAdminBookings: builder.query<AdminBooking[], void>({
            query: () => "/admin/bookings",
            providesTags: ["Booking"],
        }),
        getAdminBooking: builder.query<AdminBooking, number>({
            query: (id) => `/admin/bookings/${id}`,
            providesTags: ["Booking"],
        }),
        updateAdminBooking: builder.mutation<AdminBooking, { id: number; data: Partial<AdminBooking> }>({
            query: ({ id, data }) => ({
                url: `/admin/bookings/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Booking"],
        }),
        deleteAdminBooking: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/bookings/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Booking"],
        }),

        // Users
        getAdminUsers: builder.query<AdminUser[], void>({
            query: () => "/admin/users",
            providesTags: ["User"],
        }),
        updateAdminUser: builder.mutation<AdminUser, { id: number; data: Partial<AdminUser> }>({
            query: ({ id, data }) => ({
                url: `/admin/users/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        deleteAdminUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        // Destinations
        getAdminDestinations: builder.query<AdminDestination[], void>({
            query: () => "/admin/destinations",
            providesTags: ["Destination"],
        }),
        createAdminDestination: builder.mutation<AdminDestination, Partial<AdminDestination>>({
            query: (data) => ({
                url: "/admin/destinations",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Destination"],
        }),
        updateAdminDestination: builder.mutation<AdminDestination, { id: number; data: Partial<AdminDestination> }>({
            query: ({ id, data }) => ({
                url: `/admin/destinations/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Destination"],
        }),
        deleteAdminDestination: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/destinations/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Destination"],
        }),

        // Packages
        getAdminPackages: builder.query<AdminPackage[], void>({
            query: () => "/admin/packages",
            providesTags: ["Package"],
        }),
        getAdminPackage: builder.query<AdminPackage, number>({
            query: (id) => `/admin/packages/${id}`,
            providesTags: ["Package"],
        }),
        createAdminPackage: builder.mutation<AdminPackage, FormData | Record<string, unknown>>({
            query: (data) => ({
                url: "/admin/packages",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Package"],
        }),
        updateAdminPackage: builder.mutation<AdminPackage, { id: number; data: FormData | Record<string, unknown> }>({
            query: ({ id, data }) => ({
                url: `/admin/packages/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Package"],
        }),
        deleteAdminPackage: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/packages/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Package"],
        }),

        // Enquiries
        getAdminEnquiries: builder.query<AdminEnquiry[], void>({
            query: () => "/admin/enquiries",
            providesTags: ["Enquiry"],
        }),
        updateAdminEnquiry: builder.mutation<AdminEnquiry, { id: number; data: Partial<AdminEnquiry> }>({
            query: ({ id, data }) => ({
                url: `/admin/enquiries/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Enquiry"],
        }),
        deleteAdminEnquiry: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/enquiries/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Enquiry"],
        }),

        // Contact Messages
        getAdminContacts: builder.query<AdminContact[], void>({
            query: () => "/admin/contact",
            providesTags: ["Contact"],
        }),
        updateAdminContact: builder.mutation<AdminContact, { id: number; data: Partial<AdminContact> }>({
            query: ({ id, data }) => ({
                url: `/admin/contact/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Contact"],
        }),
        deleteAdminContact: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/contact/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Contact"],
        }),

        // Newsletter
        getAdminNewsletter: builder.query<AdminNewsletter[], void>({
            query: () => "/admin/newsletter",
            providesTags: ["Newsletter"],
        }),
        deleteAdminNewsletter: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/newsletter/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Newsletter"],
        }),

        // Experts
        getAdminExperts: builder.query<AdminExpert[], string | void>({
            query: (type) => type ? `/admin/experts?all=true&type=${type}` : "/admin/experts?all=true",
            providesTags: ["Expert"],
        }),
        createAdminExpert: builder.mutation<AdminExpert, Partial<AdminExpert>>({
            query: (data) => ({
                url: "/admin/experts",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Expert"],
        }),
        updateAdminExpert: builder.mutation<AdminExpert, { id: number; data: Partial<AdminExpert> }>({
            query: ({ id, data }) => ({
                url: `/admin/experts/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Expert"],
        }),
        deleteAdminExpert: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/experts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Expert"],
        }),

        // Sales
        getAdminSales: builder.query<AdminSale[], void>({
            query: () => "/admin/sales",
            providesTags: ["Sale"],
        }),
        getAdminSale: builder.query<AdminSale, number>({
            query: (id) => `/admin/sales/${id}`,
            providesTags: ["Sale"],
        }),
        createAdminSale: builder.mutation<AdminSale, Partial<AdminSale>>({
            query: (data) => ({
                url: "/admin/sales",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Sale"],
        }),
        updateAdminSale: builder.mutation<AdminSale, { id: number; data: Partial<AdminSale> }>({
            query: ({ id, data }) => ({
                url: `/admin/sales/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Sale"],
        }),
        deleteAdminSale: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/sales/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Sale"],
        }),

        // Feature Boxes
        getAdminFeatureBoxes: builder.query<FeatureBox[], void>({
            query: () => "/admin/feature-boxes",
            providesTags: ["FeatureBox"],
        }),
        createAdminFeatureBox: builder.mutation<FeatureBox, Partial<FeatureBox>>({
            query: (data) => ({
                url: "/admin/feature-boxes",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["FeatureBox"],
        }),
        updateAdminFeatureBox: builder.mutation<FeatureBox, { id: number; data: Partial<FeatureBox> }>({
            query: ({ id, data }) => ({
                url: `/admin/feature-boxes/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["FeatureBox"],
        }),
        patchAdminFeatureBox: builder.mutation<FeatureBox, { id: number; data: { isActive: boolean } }>({
            query: ({ id, data }) => ({
                url: `/admin/feature-boxes/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["FeatureBox"],
        }),
        deleteAdminFeatureBox: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/feature-boxes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FeatureBox"],
        }),

        // Settings
        getAdminSettings: builder.query<Record<string, string>, void>({
            query: () => "/admin/settings",
            providesTags: ["Settings"],
        }),
        updateAdminSettings: builder.mutation<void, Record<string, string>>({
            query: (data) => ({
                url: "/admin/settings",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Settings"],
        }),

        // Check Admin Access
        checkAdminAccess: builder.query<{ isAdmin: boolean }, void>({
            query: () => "/admin/check-access",
        }),

        // Upload Signature
        getUploadSignature: builder.mutation<
            { signature: string; timestamp: number; cloudName: string; apiKey: string },
            { folder: string; timestamp: number; resourceType: string }
        >({
            query: (data) => ({
                url: "/admin/upload-signature",
                method: "POST",
                body: data,
            }),
        }),

        // Tour Dates Management
        getAdminTourDates: builder.query<AdminTourDate[], number>({
            query: (packageId) => `/admin/tour-dates?packageId=${packageId}`,
            providesTags: ["TourDate"],
        }),
        createAdminTourDate: builder.mutation<AdminTourDate, AdminTourDateInput>({
            query: (data) => ({
                url: "/admin/tour-dates",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["TourDate", "Package"],
        }),
        updateAdminTourDate: builder.mutation<AdminTourDate, { id: number; data: Partial<AdminTourDateInput> }>({
            query: ({ id, data }) => ({
                url: "/admin/tour-dates",
                method: "PUT",
                body: { id, ...data },
            }),
            invalidatesTags: ["TourDate", "Package"],
        }),
        deleteAdminTourDate: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/tour-dates?id=${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["TourDate", "Package"],
        }),
    }),
})

export const {
    // Stats
    useGetAdminStatsQuery,
    // Reviews
    useGetAdminReviewsQuery,
    useCreateAdminReviewMutation,
    useUpdateAdminReviewMutation,
    useDeleteAdminReviewMutation,
    // Bookings
    useGetAdminBookingsQuery,
    useGetAdminBookingQuery,
    useUpdateAdminBookingMutation,
    useDeleteAdminBookingMutation,
    // Users
    useGetAdminUsersQuery,
    useUpdateAdminUserMutation,
    useDeleteAdminUserMutation,
    // Destinations
    useGetAdminDestinationsQuery,
    useCreateAdminDestinationMutation,
    useUpdateAdminDestinationMutation,
    useDeleteAdminDestinationMutation,
    // Packages
    useGetAdminPackagesQuery,
    useGetAdminPackageQuery,
    useCreateAdminPackageMutation,
    useUpdateAdminPackageMutation,
    useDeleteAdminPackageMutation,
    // Enquiries
    useGetAdminEnquiriesQuery,
    useUpdateAdminEnquiryMutation,
    useDeleteAdminEnquiryMutation,
    // Contacts
    useGetAdminContactsQuery,
    useUpdateAdminContactMutation,
    useDeleteAdminContactMutation,
    // Newsletter
    useGetAdminNewsletterQuery,
    useDeleteAdminNewsletterMutation,
    // Experts
    useGetAdminExpertsQuery,
    useCreateAdminExpertMutation,
    useUpdateAdminExpertMutation,
    useDeleteAdminExpertMutation,
    // Sales
    useGetAdminSalesQuery,
    useGetAdminSaleQuery,
    useCreateAdminSaleMutation,
    useUpdateAdminSaleMutation,
    useDeleteAdminSaleMutation,
    // Feature Boxes
    useGetAdminFeatureBoxesQuery,
    useCreateAdminFeatureBoxMutation,
    useUpdateAdminFeatureBoxMutation,
    usePatchAdminFeatureBoxMutation,
    useDeleteAdminFeatureBoxMutation,
    // Settings
    useGetAdminSettingsQuery,
    useUpdateAdminSettingsMutation,
    // Check Access
    useCheckAdminAccessQuery,
    // Upload
    useGetUploadSignatureMutation,
    // Tour Dates
    useGetAdminTourDatesQuery,
    useCreateAdminTourDateMutation,
    useUpdateAdminTourDateMutation,
    useDeleteAdminTourDateMutation,
} = adminApi
