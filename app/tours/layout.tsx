import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Browse Tours & Travel Deals",
    description:
        "Find the best travel deals and discounted tour packages. Filter by destination, duration, tour type, and budget. Book your next adventure with verified reviews and best price guarantee.",
    keywords: [
        "tour deals",
        "travel packages",
        "discounted tours",
        "vacation packages",
        "budget travel",
        "adventure tours",
        "group tours",
        "private tours",
        "customizable trips",
    ],
    alternates: {
        canonical: "/tours",
    },
    openGraph: {
        title: "Browse Tours & Travel Deals - Travplan",
        description:
            "Find the best travel deals and discounted tour packages. Filter by destination, duration, tour type, and budget.",
        url: "/tours",
        type: "website",
    },
}

export default function ToursLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
