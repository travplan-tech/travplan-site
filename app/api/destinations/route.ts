import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const groupByRegion = searchParams.get('groupByRegion') === 'true'
        const country = searchParams.get('country')
        const region = searchParams.get('region')

        const tourType = searchParams.get('tourType')
        const tourCategory = searchParams.get('tourCategory')
        const excludeCountry = searchParams.get('excludeCountry')
        const saleSlug = searchParams.get('saleSlug')

        // Build where clause
        const where: any = {}
        if (country) where.country = { equals: country, mode: 'insensitive' }
        if (region) where.region = region
        if (excludeCountry) where.country = { not: excludeCountry, mode: 'insensitive' }

        // Filter by package attributes if provided
        const packageWhere: any = {}
        if (tourType) packageWhere.tourType = tourType
        if (tourCategory) packageWhere.tourCategory = tourCategory
        if (saleSlug) packageWhere.sales = { some: { slug: saleSlug } }

        if (Object.keys(packageWhere).length > 0) {
            where.packages = {
                some: packageWhere
            }
        }

        const destinations = await prisma.destination.findMany({
            where,
            orderBy: {
                popularity: "desc",
            },
            select: {
                id: true,
                name: true,
                description: true,
                country: true,
                city: true,
                region: true,
                image: true,
                rating: true,
                popularity: true,
                _count: {
                    select: { packages: true }
                }
            }
        })

        // Transform to include tours count from packages
        const destinationsWithTours = destinations.map(dest => ({
            ...dest,
            tours: dest._count.packages,
            _count: undefined,
        }))

        // Cache headers
        const cacheHeaders = {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }

        // Group by region if requested
        if (groupByRegion) {
            const grouped: Record<string, typeof destinationsWithTours> = {}
            destinationsWithTours.forEach(dest => {
                const regionKey = dest.region || 'Other'
                if (!grouped[regionKey]) {
                    grouped[regionKey] = []
                }
                grouped[regionKey].push(dest)
            })
            return NextResponse.json(grouped, { headers: cacheHeaders })
        }

        return NextResponse.json(destinationsWithTours, { headers: cacheHeaders })
    } catch (error) {
        console.error("Error fetching destinations:", error)
        return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // Check admin authorization
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const body = await request.json()

        const destination = await prisma.destination.create({
            data: {
                name: body.name,
                description: body.description,
                country: body.country,
                city: body.city || null,
                region: body.region,
                image: body.image,
                rating: body.rating || 0,
                popularity: body.popularity || 0,
            },
        })

        return NextResponse.json(destination, { status: 201 })
    } catch (error) {
        console.error("Error creating destination:", error)
        return NextResponse.json({ error: "Failed to create destination" }, { status: 500 })
    }
}
