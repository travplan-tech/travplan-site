import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with Travplan for tour bookings, travel inquiries, and customer support. We're here to help you plan your next unforgettable journey.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Travplan - Get Help with Your Travel Plans",
        description:
            "Get in touch with Travplan for tour bookings, travel inquiries, and customer support. Available worldwide with 24/7 support.",
        url: "/contact",
        type: "website",
    },
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
