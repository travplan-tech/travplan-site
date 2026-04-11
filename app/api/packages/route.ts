import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const destinationId = searchParams.get("destinationId")
        const country = searchParams.get("country")
        const region = searchParams.get("region")
        const search = searchParams.get("search")
        const tourType = searchParams.get("tourType")
        const tourCategory = searchParams.get("tourCategory")
        const minPrice = searchParams.get("minPrice")
        const maxPrice = searchParams.get("maxPrice")
        const duration = searchParams.get("duration")

        const departureType = searchParams.get("departureType")
        const saleSlug = searchParams.get("saleSlug")

        // Pagination parameters
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "0") // 0 means no limit
        const sortBy = searchParams.get("sortBy") || "popular"

        // Build the where clause
        interface WhereClause {
            destinationId?: number
            destination?: {
                country?: string | { not: string }
                region?: string
            }
            tourType?: string
            tourCategory?: string
            departureType?: string
            price?: {
                gte?: number
                lte?: number
            }
            OR?: Array<{
                title?: { contains: string; mode: "insensitive" }
                description?: { contains: string; mode: "insensitive" }
                cities?: { contains: string; mode: "insensitive" }
                destination?: {
                    name?: { contains: string; mode: "insensitive" }
                    country?: { contains: string; mode: "insensitive" }
                    region?: { contains: string; mode: "insensitive" }
                }
            }>
            sales?: {
                some: {
                    slug: string
                }
            }
        }

        const where: WhereClause = {}

        if (destinationId) {
            where.destinationId = Number.parseInt(destinationId)
        }

        // Support both country filtering and exclusion
        const excludeCountry = searchParams.get("excludeCountry")

        if (country || region || excludeCountry) {
            where.destination = {}
            if (country) where.destination.country = country
            if (region) where.destination.region = region
            if (excludeCountry) {
                // Filter to NOT include this country (for international filter)
                where.destination.country = { not: excludeCountry }
            }
        }

        // Search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { cities: { contains: search, mode: "insensitive" } },
                { destination: { name: { contains: search, mode: "insensitive" } } },
                { destination: { country: { contains: search, mode: "insensitive" } } },
                { destination: { region: { contains: search, mode: "insensitive" } } },
            ]
        }

        // Tour type filter
        if (tourType) {
            where.tourType = { contains: tourType } as any
        }

        // Tour category filter
        if (tourCategory) {
            where.tourCategory = tourCategory
        }

        // Departure type filter
        if (departureType) {
            where.departureType = departureType
        }

        // Sale filter
        if (saleSlug) {
            where.sales = {
                some: {
                    slug: saleSlug
                }
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice)
            if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }

        // Build orderBy based on sortBy parameter
        let orderBy: object = { createdAt: "desc" } // default: popular/recommended
        switch (sortBy) {
            case "price-low":
                orderBy = { price: "asc" }
                break
            case "price-high":
                orderBy = { price: "desc" }
                break
            case "rating":
                orderBy = { rating: "desc" }
                break
            case "duration":
                // We'll handle duration sort in memory if needed, but simple string sort might be okay? 
                // String sort "10" comes before "2". So "2 Days" > "10 Days" in string asc? No.
                // We better rely on default or price for now.
                // If accurate duration sort is needed, it must be in memory.
                orderBy = { createdAt: "desc" }
                break
        }

        // Fetch ALL matching packages (without pagination first)
        const packages = await prisma.package.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                originalPrice: true,
                duration: true,
                cities: true,
                rating: true,
                image: true,
                mapImage: true,
                galleryImages: true,
                tourType: true,
                tourCategory: true,
                maxPersons: true,
                accommodation: true,
                ageRange: true,
                discountPercent: true,
                tags: true,
                isCustomizable: true,
                bestPrice: true,
                departureDates: true,
                departureType: true,
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
                        rating: true,
                    }
                }
            },
            orderBy,
        })

        // In-memory filtering for duration
        let filteredPackages = packages
        if (duration) {
            let minDict = 0
            let maxDict = 1000

            if (duration.includes("1-3")) { maxDict = 3 }
            else if (duration.includes("4-7")) { minDict = 4; maxDict = 7 }
            else if (duration.includes("8-14")) { minDict = 8; maxDict = 14 }
            else if (duration.includes("15-21")) { minDict = 15; maxDict = 21 }
            else if (duration.includes("22+")) { minDict = 22 }

            filteredPackages = packages.filter(pkg => {
                const days = parseInt(pkg.duration) || 0
                return days >= minDict && days <= maxDict
            })
        }

        // Handle In-Memory Sorting if needed (e.g. Duration)
        if (sortBy === "duration") {
            filteredPackages.sort((a, b) => {
                const durA = parseInt(a.duration) || 0
                const durB = parseInt(b.duration) || 0
                return durA - durB
            })
        }

        const total = filteredPackages.length

        // Pagination
        let paginatedPackages = filteredPackages
        if (limit > 0) {
            const startIndex = (page - 1) * limit
            paginatedPackages = filteredPackages.slice(startIndex, startIndex + limit)
        }

        // Transform packages
        const transformedPackages = paginatedPackages.map(pkg => {
            // Calculate average rating from reviews if available
            const avgRating = pkg.reviews.length > 0
                ? pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length
                : pkg.rating || 0 // Fallback to DB rating or 0

            return {
                ...pkg,
                rating: avgRating,
                reviewCount: pkg.reviews.length,
                tags: pkg.tags ? pkg.tags.split(",").map(t => t.trim()) : [],
                destinations: pkg.cities ? pkg.cities.split(",").map(c => c.trim()) : [],
                galleryImages: pkg.galleryImages ? pkg.galleryImages.split(",").map(img => img.trim()).filter(Boolean) : [],
                upcomingDepartures: pkg.departureDates ? JSON.parse(pkg.departureDates) : [],
                originalPrice: pkg.originalPrice,
                saving: pkg.originalPrice && pkg.originalPrice > pkg.price ? Math.round(pkg.originalPrice - pkg.price) : 0,
            }
        })

        // Cache headers for all responses
        const cacheHeaders = {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }

        // Return logic
        if (limit > 0) {
            const totalPages = Math.ceil(total / limit)
            return NextResponse.json({
                packages: transformedPackages,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                }
            }, { headers: cacheHeaders })
        }

        return NextResponse.json(transformedPackages, { headers: cacheHeaders })
    } catch (error) {
        console.error("Error fetching packages:", error)
        return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
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

        // Prepare TourDate creation data
        let tourDateSlotsCreate = undefined
        if (body.departureDates) {
            try {
                const dates = JSON.parse(body.departureDates)
                // Extract number of days from duration string (e.g. "5 Days" -> 5)
                const durationMatch = (body.duration || "").match(/(\d+)/)
                const durationDays = durationMatch ? parseInt(durationMatch[0]) : 1

                const roomConfig = body.roomConfig || {}

                // Create array of TourDate inputs
                const slots = dates.map((d: any) => {
                    // d.date is expected to be YYYY-MM-DD from the new date input
                    const startDate = new Date(d.date)
                    const endDate = new Date(startDate)
                    endDate.setDate(endDate.getDate() + Math.max(0, durationDays - 1))

                    // Format label (e.g. 05 Jan) if d.date is a valid date string
                    let dateLabel = d.date
                    if (!isNaN(startDate.getTime())) {
                        dateLabel = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    }

                    // Room Availability
                    const roomsCreate = []
                    for (let type = 1; type <= 4; type++) {
                        const config = roomConfig[type] || roomConfig[String(type)]
                        if (config && config.quantity > 0) {
                            roomsCreate.push({
                                roomType: type, // 1=Single, 2=Double...
                                totalRooms: Number(config.quantity),
                                availableRooms: Number(config.quantity),
                                pricePerRoom: Number(config.price)
                            })
                        }
                    }

                    return {
                        startDate: isNaN(startDate.getTime()) ? new Date() : startDate,
                        endDate: isNaN(endDate.getTime()) ? new Date() : endDate,
                        dateLabel,
                        price: d.price || null,
                        totalSeats: d.seatsRemaining ? Number(d.seatsRemaining) : 20,
                        availableSeats: d.seatsRemaining ? Number(d.seatsRemaining) : 20,
                        roomAvailability: {
                            create: roomsCreate
                        }
                    }
                })

                if (slots.length > 0) {
                    tourDateSlotsCreate = { create: slots }
                }
            } catch (e) {
                console.error("Error parsing departure dates or rooms for relational creation", e)
            }
        }

        const pkg = await prisma.package.create({
            data: {
                title: body.title,
                description: body.description,
                destinationId: body.destinationId,
                price: body.price,
                originalPrice: body.originalPrice,
                duration: body.duration,
                image: body.image,
                mapImage: body.mapImage,
                galleryImages: body.galleryImages,
                highlights: body.highlights,
                specialNotes: body.specialNotes,
                tourType: body.tourType,
                tourCategory: body.tourCategory || "PRIVATE",
                maxPersons: body.maxPersons || 10,
                accommodation: body.accommodation,
                ageRange: body.ageRange,
                discountPercent: body.discountPercent,
                tags: body.tags,
                isCustomizable: body.isCustomizable,
                bestPrice: body.bestPrice,
                departureDates: body.departureDates,
                departureType: body.departureType,
                departurePoints: body.departurePoints,
                itinerary: body.itinerary,
                itineraryPdf: body.itineraryPdf || null,
                inclusions: body.inclusions,
                exclusions: body.exclusions,
                cancellationPolicy: body.cancellationPolicy,
                priceChartImage: body.priceChartImage,
                cities: body.cities,
                tourDateSlots: tourDateSlotsCreate,
            },
            include: {
                destination: true,
            },
        })

        return NextResponse.json(pkg, { status: 201 })
    } catch (error) {
        console.error("Error creating package:", error)
        return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
    }
}
