import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import TripDetailClient, { TourData } from "./TripDetailClient";

// Force dynamic rendering so admin changes (e.g., brochure PDF uploads) are reflected immediately
export const dynamic = "force-dynamic";

// Cache the package fetch to avoid duplicate calls between generateMetadata and page
const getPackage = cache(async (id: number) => {
    const pkg = await prisma.package.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            description: true,
            destinationId: true,
            price: true,
            originalPrice: true,
            duration: true,
            cities: true,
            rating: true,
            image: true,
            mapImage: true,
            galleryImages: true,
            highlights: true,
            specialNotes: true,
            tourType: true,
            tourCategory: true,
            maxPersons: true,
            accommodation: true,
            ageRange: true,
            discountPercent: true,
            tags: true,
            isCustomizable: true,
            bestPrice: true,
            flightsIncluded: true,
            departureDates: true,
            departureType: true,
            departurePoints: true,
            itinerary: true,
            itineraryPdf: true,
            inclusions: true,
            exclusions: true,
            cancellationPolicy: true,
            priceChartImage: true,
            destination: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                    region: true,
                }
            },
            reviews: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    avatar: true,
                    createdAt: true,
                    user: {
                        select: {
                            name: true,
                            image: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 10,
            },
            tourDateSlots: {
                where: {
                    isActive: true,
                    startDate: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    startDate: "asc"
                },
                select: {
                    startDate: true,
                    dateLabel: true,
                    availableSeats: true,
                    price: true
                }
            }
        }
    });

    if (!pkg) return null;

    // Transform package data to match TourData interface
    const transformedPackage: TourData = {
        id: pkg.id,
        title: pkg.title,
        tags: pkg.tags ? pkg.tags.split(",").map(tag => tag.trim()) : [],
        description: pkg.description,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        duration: pkg.duration,
        rating: pkg.reviews.length > 0
            ? pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length
            : pkg.rating || 0,
        reviewCount: pkg.reviews.length,
        image: pkg.image,
        mapImage: pkg.mapImage,
        priceChartImage: pkg.priceChartImage,
        galleryImages: pkg.galleryImages ? pkg.galleryImages.split(",").map(url => url.trim()) : [],
        highlights: pkg.highlights ? pkg.highlights.split("\n").filter(Boolean) : [],
        specialNotes: pkg.specialNotes || null,
        itinerary: pkg.itinerary ? JSON.parse(pkg.itinerary) : [],
        tourType: pkg.tourType,
        tourCategory: pkg.tourCategory || undefined,
        maxPersons: pkg.maxPersons || undefined,
        ageRange: pkg.ageRange,
        accommodation: pkg.accommodation,
        destinations: pkg.cities ? pkg.cities.split(",").map(c => c.trim()) : [],
        departurePoints: pkg.departurePoints ? pkg.departurePoints.split(",").map(p => p.trim()) : [],
        inclusions: pkg.inclusions ? pkg.inclusions.split("\n").filter(Boolean) : [],
        exclusions: pkg.exclusions ? pkg.exclusions.split("\n").filter(Boolean) : [],
        itineraryPdf: pkg.itineraryPdf,
        isCustomizable: pkg.isCustomizable || false,
        bestPrice: pkg.bestPrice || false,
        flightsIncluded: pkg.hasOwnProperty('flightsIncluded') ? (pkg as any).flightsIncluded : false,
        cancellationPolicy: pkg.cancellationPolicy,
        upcomingDepartures: pkg.tourDateSlots && pkg.tourDateSlots.length > 0
            ? pkg.tourDateSlots.map(slot => ({
                date: new Date(slot.startDate).toISOString().split('T')[0],
                seatsRemaining: slot.availableSeats,
                price: slot.price
            }))
            : (pkg.departureDates ? JSON.parse(pkg.departureDates) : []),
        reviews: pkg.reviews.map(r => ({
            id: r.id,
            user: {
                name: r.user.name,
                image: r.user.image,
            },
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
        })),
        destination: {
            name: pkg.destination?.name || "Unknown",
            country: pkg.destination?.country || null,
        },
    };

    return transformedPackage;
});

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const packageId = parseInt(id);

    if (isNaN(packageId)) {
        return { title: "Tour Not Found" };
    }

    const pkg = await getPackage(packageId);

    if (!pkg) {
        return { title: "Tour Not Found" };
    }

    const title = `${pkg.title} | Travplan`;
    const description = pkg.description || `Explore ${pkg.title} with Travplan. ${pkg.duration} tour with prices starting from ₹${pkg.price.toLocaleString("en-IN")}`;

    return {
        title,
        description,
        alternates: {
            canonical: `/destinations/trip/${pkg.id}`,
        },
        openGraph: {
            title,
            description,
            url: `/destinations/trip/${pkg.id}`,
            type: "website",
            images: pkg.image ? [{ url: pkg.image, alt: pkg.title }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: pkg.image ? [pkg.image] : undefined,
        },
    };
}

// Generate Schema.org structured data
function generateJsonLd(tourData: TourData) {
    const mainImage = tourData.image || "/placeholder.jpg";
    const galleryImages = tourData.galleryImages.length > 0
        ? tourData.galleryImages
        : [mainImage, mainImage];

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "TouristTrip",
                "@id": `https://travel-1-plan.vercel.app/destinations/trip/${tourData.id}#touristtrip`,
                name: tourData.title,
                description: tourData.description || `Explore ${tourData.title} with Travplan`,
                image: mainImage,
                url: `https://travel-1-plan.vercel.app/destinations/trip/${tourData.id}`,
                touristType: tourData.tourType || "All travelers",
                itinerary: {
                    "@type": "ItemList",
                    numberOfItems: tourData.itinerary.length,
                    itemListElement: tourData.itinerary.map((day, index) => ({
                        "@type": "ListItem",
                        position: index + 1,
                        name: `Day ${day.day}: ${day.title}`,
                        description: day.description,
                    })),
                },
                offers: {
                    "@type": "Offer",
                    price: tourData.price,
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    url: `https://travel-1-plan.vercel.app/destinations/trip/${tourData.id}`,
                    validFrom: new Date().toISOString(),
                    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    seller: {
                        "@type": "Organization",
                        name: "Travplan",
                        url: "https://travel-1-plan.vercel.app",
                    },
                },
                provider: {
                    "@type": "TravelAgency",
                    name: "Travplan",
                    url: "https://travel-1-plan.vercel.app",
                },
            },
            {
                "@type": "Product",
                "@id": `https://travel-1-plan.vercel.app/destinations/trip/${tourData.id}#product`,
                name: tourData.title,
                description: tourData.description || `Explore ${tourData.title}`,
                image: [mainImage, ...galleryImages],
                sku: `TOUR-${tourData.id}`,
                brand: {
                    "@type": "Brand",
                    name: "Travplan",
                },
                offers: {
                    "@type": "Offer",
                    price: tourData.price,
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    url: `https://travel-1-plan.vercel.app/destinations/trip/${tourData.id}`,
                    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                },
                aggregateRating: tourData.reviewCount > 0 ? {
                    "@type": "AggregateRating",
                    ratingValue: tourData.rating?.toFixed(1) || "0",
                    reviewCount: tourData.reviewCount,
                    bestRating: "5",
                    worstRating: "1",
                } : undefined,
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Home",
                        item: "https://travel-1-plan.vercel.app",
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Destinations",
                        item: "https://travel-1-plan.vercel.app/destinations",
                    },
                    ...(tourData.destination?.country ? [{
                        "@type": "ListItem",
                        position: 3,
                        name: tourData.destination.country,
                        item: `https://travel-1-plan.vercel.app/destinations?country=${encodeURIComponent(tourData.destination.country)}`,
                    }] : []),
                    {
                        "@type": "ListItem",
                        position: tourData.destination?.country ? 4 : 3,
                        name: tourData.title,
                        item: `https://travel-1-plan.vercel.app/destinations/trip/${tourData.id}`,
                    },
                ],
            },
        ],
    };
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const packageId = parseInt(id);

    if (isNaN(packageId)) {
        notFound();
    }

    const tourData = await getPackage(packageId);

    if (!tourData) {
        notFound();
    }

    const jsonLd = generateJsonLd(tourData);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TripDetailClient tourData={tourData} />
        </>
    );
}
