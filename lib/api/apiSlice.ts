import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        credentials: "include",
    }),
    tagTypes: [
        "Destination",
        "Package",
        "Booking",
        "Review",
        "User",
        "Enquiry",
        "Contact",
        "Newsletter",
        "Expert",
        "FeatureBox",
        "Sale",
        "Stats",
        "Coupon",
        "Settings",
        "HomepageSettings",
        "TourDate",
        "Favorite"
    ],
    endpoints: () => ({}),
})
