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
        images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
    },
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
