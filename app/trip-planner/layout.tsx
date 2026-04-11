import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Plan Your Custom Trip",
    description:
        "Create your perfect customized trip with Travplan's easy trip planner. Tell us your preferences and get a personalized travel itinerary from local experts.",
    keywords: [
        "trip planner",
        "custom tour",
        "personalized travel",
        "travel planning",
        "customized itinerary",
        "travel expert",
        "bespoke travel",
        "tailor-made tours",
    ],
    alternates: {
        canonical: "/trip-planner",
    },
    openGraph: {
        title: "Plan Your Custom Trip - Travplan",
        description:
            "Create your perfect customized trip with our easy trip planner. Get a personalized travel itinerary from local experts.",
        url: "/trip-planner",
        type: "website",
    },
}

export default function TripPlannerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
