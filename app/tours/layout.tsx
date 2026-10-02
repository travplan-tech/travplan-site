import { Metadata } from "next"

export const metadata: Metadata = {
    title: { absolute: "Tour Packages & Group Departures | Travplan" },
    description:
        "Browse Travplan tour packages, group departures and holiday trips. Find curated routes, inclusions, travel dates and enquiry options.",
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
        title: "Tour Packages & Group Departures | Travplan",
        description:
            "Browse Travplan tour packages, group departures and holiday trips. Find curated routes, inclusions and travel dates.",
        url: "/tours",
        type: "website",
        images: ["/og-image.jpg"],
    },
}

export default function ToursLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
