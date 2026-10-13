import { Metadata } from "next"

export const metadata: Metadata = {
    title: { absolute: "Custom Trip Planner for Holidays | Travplan" },
    description:
        "Plan a custom holiday with Travplan. Share your destination, budget and travel dates to get itinerary support for India and international trips.",
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
        title: "Custom Trip Planner for Holidays | Travplan",
        description:
            "Plan a custom holiday with Travplan. Share your destination, budget and travel dates to get itinerary support.",
        url: "/trip-planner",
        type: "website",
        images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
    },
}

export default function TripPlannerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
