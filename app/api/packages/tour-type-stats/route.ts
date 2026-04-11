import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const destinationId = searchParams.get("destinationId")
        const country = searchParams.get("country")
        const region = searchParams.get("region")
        const saleSlug = searchParams.get("saleSlug")

        const tourCategory = searchParams.get("tourCategory")
        const excludeCountry = searchParams.get("excludeCountry")

        const where: any = {}
        const destFilter: any = {}

        // Destination ID takes priority over country/region
        if (destinationId) {
            where.destinationId = Number.parseInt(destinationId)
        } else {
            if (country) destFilter.country = country
            else if (excludeCountry) destFilter.country = { not: excludeCountry }

            if (region) destFilter.region = region

            if (Object.keys(destFilter).length > 0) where.destination = destFilter
        }

        if (saleSlug) where.sales = { some: { slug: saleSlug } }
        if (tourCategory) where.tourCategory = tourCategory

        // Get all matching packages to aggregate tour types manually
        // Note: Using groupBy on a field that now contains comma-separated values won't work for individual counts
        const packages = await prisma.package.findMany({
            where,
            select: {
                tourType: true
            }
        })

        // Transform the result into a simple object
        const result: Record<string, number> = {}

        // Initialize default tour types with 0
        const defaultTypes = ["Family", "Couples", "Friends", "Adventure", "Cultural & Architecture", "Pilgrim Tours", "Luxury", "Instagrammable"]
        defaultTypes.forEach(type => {
            result[type] = 0
        })

        packages.forEach(pkg => {
            if (pkg.tourType) {
                // Split by comma and trim each type
                const types = pkg.tourType.split(',').map(t => t.trim())
                types.forEach(type => {
                    if (type) {
                        result[type] = (result[type] || 0) + 1
                    }
                })
            }
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to fetch tour type stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch tour type statistics" },
            { status: 500 }
        )
    }
}
