import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    try {
        const tour = await prisma.package.findUnique({
            where: { id },
            select: {
                title: true,
                description: true,
                image: true,
                price: true,
                duration: true,
                tourType: true,
                destination: {
                    select: {
                        name: true,
                        country: true,
                    },
                },
            },
        })

        if (!tour) {
            return {
                title: "Tour Not Found",
                description: "The requested tour package could not be found.",
            }
        }

        const country = tour.destination?.country || ""
        const destination = tour.destination?.name || ""

        return {
            title: tour.title,
            description:
                tour.description ||
                `Book ${tour.title} - ${tour.duration} tour package in ${destination}, ${country}. Starting from ₹${tour.price?.toLocaleString("en-IN")}. Best prices guaranteed with Travplan.`,
            keywords: [
                tour.title,
                destination,
                country,
                tour.tourType || "tour",
                "travel package",
                "vacation",
                "tour booking",
                `${country} tours`,
                `${tour.duration} trip`,
            ].filter(Boolean),
            alternates: {
                canonical: `/destinations/trip/${id}`,
            },
            openGraph: {
                title: `${tour.title} | Travplan`,
                description:
                    tour.description ||
                    `Book ${tour.title} - ${tour.duration} tour in ${destination}. Starting from ₹${tour.price?.toLocaleString("en-IN")}.`,
                url: `/destinations/trip/${id}`,
                type: "website",
                images: tour.image
                    ? [
                        {
                            url: tour.image,
                            width: 1200,
                            height: 630,
                            alt: tour.title,
                        },
                    ]
                    : undefined,
            },
            twitter: {
                card: "summary_large_image",
                title: `${tour.title} | Travplan`,
                description:
                    tour.description ||
                    `Book ${tour.title} - ${tour.duration} tour. Starting from ₹${tour.price?.toLocaleString("en-IN")}.`,
                images: tour.image ? [tour.image] : undefined,
            },
        }
    } catch {
        return {
            title: "Tour Package",
            description: "Explore amazing tour packages with Travplan.",
        }
    }
}

export default function TourDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
