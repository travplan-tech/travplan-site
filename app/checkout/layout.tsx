import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Checkout",
    description:
        "Complete your tour booking with Travplan. Secure checkout with multiple payment options and instant confirmation.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "/checkout",
    },
}

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
