import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

// GET - List all packages for admin
export async function GET() {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const packages = await prisma.package.findMany({
            take: 100,
            select: {
                id: true,
                title: true,
                price: true,
                originalPrice: true,
                duration: true,
                rating: true,
                image: true,
                tourType: true,
                tourCategory: true,
                createdAt: true,
                destination: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(packages)
    } catch (error) {
        console.error("Error fetching packages:", error)
        return NextResponse.json(
            { error: "Failed to fetch packages" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const body = await request.json()

        const packageData = await prisma.package.create({
            data: {
                title: body.title,
                description: body.description,
                price: body.price,
                originalPrice: body.originalPrice,
                duration: body.duration,
                cities: body.cities,
                destinationId: body.destinationId,
                image: body.image,
                mapImage: body.mapImage,
                galleryImages: body.galleryImages,
                highlights: body.highlights,
                tourType: body.tourType,
                tourCategory: body.tourCategory,
                maxPersons: body.maxPersons,
                accommodation: body.accommodation,
                ageRange: body.ageRange,
                discountPercent: body.discountPercent,
                tags: body.tags,
                isCustomizable: body.isCustomizable,
                bestPrice: body.bestPrice,
                flightsIncluded: body.flightsIncluded,
                departureDates: body.departureDates,
                departureType: body.departureType,
                departurePoints: body.departurePoints,
                itinerary: body.itinerary,
                itineraryPdf: body.itineraryPdf || null,
                inclusions: body.inclusions,
                exclusions: body.exclusions,
                cancellationPolicy: body.cancellationPolicy,
                priceChartImage: body.priceChartImage,
            },
            include: {
                destination: true,
            },
        })

        return NextResponse.json(packageData, { status: 201 })
    } catch (error) {
        console.error("Error creating package:", error)
        return NextResponse.json(
            { error: "Failed to create package" },
            { status: 500 }
        )
    }
}
