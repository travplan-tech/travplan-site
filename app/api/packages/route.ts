import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { getPackagesList } from "@/lib/packages-data"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const num = (key: string) => {
        const raw = searchParams.get(key)
        if (raw === null || raw === "") return undefined
        const parsed = Number(raw)
        return Number.isFinite(parsed) ? parsed : undefined
    }
    const str = (key: string) => searchParams.get(key) || undefined

    // The query itself lives in lib/packages-data so the listing pages can
    // prerender the same rows from the same cache.
    const result = await getPackagesList({
        destinationId: num("destinationId"),
        country: str("country"),
        region: str("region"),
        excludeCountry: str("excludeCountry"),
        search: str("search"),
        tourType: str("tourType"),
        tourCategory: str("tourCategory"),
        departureType: str("departureType"),
        saleSlug: str("saleSlug"),
        minPrice: num("minPrice"),
        maxPrice: num("maxPrice"),
        duration: str("duration"),
        page: num("page") ?? 1,
        limit: num("limit") ?? 0,
        sortBy: str("sortBy") ?? "popular",
    })

    if (!result) {
        return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
    }

    const cacheHeaders = {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    }

    // Paginated callers get the envelope; everyone else gets a plain array,
    // which is the shape this endpoint has always returned.
    if (result.limit > 0) {
        return NextResponse.json(
            {
                packages: result.packages,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            },
            { headers: cacheHeaders }
        )
    }

    return NextResponse.json(result.packages, { headers: cacheHeaders })
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
