import { Metadata } from "next"

// app/about/page.tsx is a client component and cannot export metadata itself,
// so the About page's SEO lives here.
export const metadata: Metadata = {
    title: { absolute: "About Travplan | Travel Planners in Delhi" },
    description:
        "Learn about Travplan, a Delhi-based travel planning team for curated group tours, custom holidays and India and international trips.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "About Travplan | Travel Planners in Delhi",
        description:
            "Learn about Travplan, a Delhi-based travel planning team for curated group tours, custom holidays and India and international trips.",
        url: "/about",
        type: "website",
        images: ["/og-image.jpg"],
    },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children
}
