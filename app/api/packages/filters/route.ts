import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const country = searchParams.get("country")

        // Build base where clause
        interface WhereClause {
            destination?: {
                country?: string
            }
        }
        const where: WhereClause = {}

        if (country) {
            where.destination = { country }
        }

        // Fetch all unique filter values from packages
        const packages = await prisma.package.findMany({
            where,
            select: {
                tourType: true,
                departureType: true,
                duration: true,
                discountPercent: true,
                tags: true,
            },
        })

        // Extract unique tour types (split comma-separated values)
        const tourTypes = [...new Set(
            packages
                .flatMap(p => p.tourType ? p.tourType.split(',').map(t => t.trim()) : [])
                .filter((t): t is string => t !== null && t.length > 0)
        )].sort()

        // Extract unique departure types
        const departureTypes = [...new Set(
            packages
                .map(p => p.departureType)
                .filter((t): t is string => t !== null && t.length > 0)
        )].sort()

        // Parse durations and group them into ranges
        const durationDays = packages.map(p => {
            if (!p.duration) return 0
            const match = p.duration.match(/(\d+)/)
            return match ? parseInt(match[1]) : 0
        }).filter(d => d > 0)

        const durationRanges: string[] = []
        const maxDuration = Math.max(...durationDays, 0)

        if (durationDays.some(d => d >= 1 && d <= 3)) durationRanges.push("1-3 Days")
        if (durationDays.some(d => d >= 4 && d <= 7)) durationRanges.push("4-7 Days")
        if (durationDays.some(d => d >= 8 && d <= 14)) durationRanges.push("8-14 Days")
        if (durationDays.some(d => d >= 15 && d <= 21)) durationRanges.push("15-21 Days")
        if (durationDays.some(d => d >= 22)) durationRanges.push("22+ Days")

        // Extract unique tags (discount deals can be derived from tags or discountPercent)
        const allTags = packages
            .flatMap(p => p.tags ? p.tags.split(",").map(t => t.trim()) : [])
            .filter(t => t.length > 0)
        const uniqueTags = [...new Set(allTags)].sort()

        // Create discount deal categories based on discountPercent
        const discountDeals: string[] = []
        if (packages.some(p => (p.discountPercent || 0) >= 30)) discountDeals.push("Flash Sale")
        if (packages.some(p => (p.discountPercent || 0) >= 20)) discountDeals.push("Early Bird")
        if (packages.some(p => (p.discountPercent || 0) >= 10)) discountDeals.push("Last Minute")
        if (packages.some(p => (p.discountPercent || 0) >= 5)) discountDeals.push("Group Discount")
        if (packages.some(p => (p.discountPercent || 0) > 0)) discountDeals.push("Seasonal Offer")

        // Get price range
        const priceResult = await prisma.package.aggregate({
            where,
            _min: { price: true },
            _max: { price: true },
        })

        // Explicitly convert Prisma Decimal to JavaScript number
        const minPrice = priceResult._min.price ? Number(priceResult._min.price) : 0
        const maxPrice = priceResult._max.price ? Number(priceResult._max.price) : 500000

        return NextResponse.json({
            tourTypes,
            departureTypes,
            durationRanges,
            discountDeals: [...new Set(discountDeals)],
            tags: uniqueTags,
            priceRange: {
                min: minPrice,
                max: maxPrice,
            },
        })
    } catch (error) {
        console.error("Error fetching filter options:", error)
        return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 })
    }
}
