import { Metadata } from "next"

export const metadata: Metadata = {
    title: "My Profile",
    description:
        "Manage your Travplan account, view your bookings, update your profile information, and access your travel history.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "/profile",
    },
}

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
