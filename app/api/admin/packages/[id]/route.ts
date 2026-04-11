import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const body = await request.json()
        const { id } = await params
        const packageId = parseInt(id)

        const packageData = await prisma.package.update({
            where: { id: packageId },
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

        return NextResponse.json(packageData)
    } catch (error) {
        console.error("Error updating package:", error)
        return NextResponse.json(
            { error: "Failed to update package" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const { id } = await params
        const packageId = parseInt(id)

        await prisma.package.delete({
            where: { id: packageId },
        })

        return NextResponse.json({ message: "Package deleted successfully" })
    } catch (error) {
        console.error("Error deleting package:", error)
        return NextResponse.json(
            { error: "Failed to delete package" },
            { status: 500 }
        )
    }
}
