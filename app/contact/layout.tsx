import { Metadata } from "next"

export const metadata: Metadata = {
    title: { absolute: "Contact Travplan Travel Agency in Delhi" },
    description:
        "Contact Travplan for India and international tour packages, custom holidays, group trips, WhatsApp enquiries and travel planning support.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Travplan Travel Agency in Delhi",
        description:
            "Contact Travplan for India and international tour packages, custom holidays, group trips and travel planning support.",
        url: "/contact",
        type: "website",
        images: ["/og-image.jpg"],
    },
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
