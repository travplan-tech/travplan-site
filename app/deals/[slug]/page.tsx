import { Metadata } from "next"
import { notFound } from "next/navigation"
import DestinationHero from "@/components/destination-hero"
import BestTours from "@/components/best-tours"
import TailoredTours from "@/components/tailored-tours"
import FAQ from "@/components/faq"
import TravelersPhotos from "@/components/travelers-photos"
import { prisma } from "@/lib/prisma"

// Prevent Next.js from caching this page - always fetch fresh sale data
export const dynamic = "force-dynamic"

interface SalePageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: SalePageProps): Promise<Metadata> {
    const { slug } = await params

    try {
        const sale = await prisma.sale.findUnique({
            where: { slug },
            select: {
                name: true,
                description: true,
                heroImage: true,
            },
        })

        if (!sale) {
            return {
                title: "Deal Not Found",
                description: "The requested deal could not be found.",
            }
        }

        return {
            title: `${sale.name} - Special Travel Deals`,
            description:
                sale.description ||
                `Discover amazing travel deals with ${sale.name}. Book now and save on your next adventure with Travplan.`,
            keywords: [
                sale.name,
                "travel deals",
                "tour discounts",
                "vacation sale",
                "travel offers",
                "holiday deals",
            ],
            alternates: {
                canonical: `/deals/${slug}`,
            },
            openGraph: {
                title: `${sale.name} - Special Travel Deals | Travplan`,
                description:
                    sale.description ||
                    `Discover amazing travel deals with ${sale.name}. Book now and save!`,
                url: `/deals/${slug}`,
                type: "website",
                images: sale.heroImage
                    ? [
                        {
                            url: sale.heroImage,
                            width: 1200,
                            height: 630,
                            alt: sale.name,
                        },
                    ]
                    : undefined,
            },
        }
    } catch {
        return {
            title: "Travel Deals",
            description: "Explore special travel deals and discounts with Travplan.",
        }
    }
}

export default async function SalePage({ params }: SalePageProps) {
    const { slug } = await params

    const sale = await prisma.sale.findUnique({
        where: { slug }
    })

    if (!sale || !sale.isActive) {
        notFound()
    }

    // Schema.org structured data for this sale
    const saleSchema = {
        "@context": "https://schema.org",
        "@type": "Sale",
        name: sale.name,
        description: sale.description || `Special travel deals - ${sale.name}`,
        url: `https://travel-1-plan.vercel.app/deals/${sale.slug}`,
        image: sale.heroImage,
        seller: {
            "@type": "TravelAgency",
            name: "Travplan",
            url: "https://travel-1-plan.vercel.app",
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(saleSchema) }}
            />
            <main className="w-full">
                <DestinationHero
                    title={sale.name}
                    description={sale.description || undefined}
                    image={sale.heroImage || undefined}
                />
                <BestTours saleSlug={sale.slug} />
                <TailoredTours saleSlug={sale.slug} />
                <FAQ />
                <TravelersPhotos />
            </main>
        </>
    )
}
