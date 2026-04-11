import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Explore Destinations",
    description:
        "Explore amazing travel destinations worldwide. Browse curated tour packages by country, region, or tour type. Find your perfect vacation with verified reviews and best prices.",
    keywords: [
        "travel destinations",
        "tour destinations",
        "vacation spots",
        "international destinations",
        "domestic tours India",
        "Asia tours",
        "Europe tours",
        "adventure destinations",
    ],
    alternates: {
        canonical: "/destinations",
    },
    openGraph: {
        title: "Explore Travel Destinations - Travplan",
        description:
            "Explore amazing travel destinations worldwide. Browse curated tour packages by country, region, or tour type.",
        url: "/destinations",
        type: "website",
    },
}

export default function DestinationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
