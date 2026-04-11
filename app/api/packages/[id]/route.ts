import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const packageId = parseInt(id)

        if (isNaN(packageId)) {
            return NextResponse.json({ error: "Invalid package ID" }, { status: 400 })
        }

        const pkg = await prisma.package.findUnique({
            where: { id: packageId },
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
                departureDates: true,
                flightsIncluded: true,
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
                    take: 10, // Limit reviews initially
                },
                tourDateSlots: {
                    where: {
                        isActive: true,
                        startDate: {
                            gte: new Date()
                        }
                    },
                    select: {
                        id: true,
                        startDate: true,
                        dateLabel: true,
                        price: true,
                        availableSeats: true,
                        totalSeats: true,
                        roomAvailability: {
                            select: {
                                id: true,
                                roomType: true,
                                totalRooms: true,
                                availableRooms: true,
                                pricePerRoom: true,
                            },
                            orderBy: {
                                roomType: "asc"
                            }
                        }
                    },
                    orderBy: {
                        startDate: "asc"
                    }
                }
            }
        })

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 })
        }

        // Transform the package data
        const transformedPackage = {
            ...pkg,
            rating: pkg.reviews.length > 0
                ? pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length
                : pkg.rating || 0,
            reviewCount: pkg.reviews.length,
            tags: pkg.tags ? pkg.tags.split(",").map(t => t.trim()) : [],
            destinations: pkg.cities ? pkg.cities.split(",").map(c => c.trim()) : [],
            upcomingDepartures: pkg.departureDates ? JSON.parse(pkg.departureDates) : [],
            highlights: pkg.highlights ? pkg.highlights.split("\n").filter(Boolean) : [],
            specialNotes: pkg.specialNotes || null,
            inclusions: pkg.inclusions ? pkg.inclusions.split("\n").filter(Boolean) : [],
            exclusions: pkg.exclusions ? pkg.exclusions.split("\n").filter(Boolean) : [],
            galleryImages: pkg.galleryImages ? pkg.galleryImages.split(",").map(url => url.trim()) : [],
            itinerary: pkg.itinerary ? JSON.parse(pkg.itinerary) : [],
            departurePoints: pkg.departurePoints ? pkg.departurePoints.split(",").map(p => p.trim()) : [],
            originalPrice: pkg.originalPrice,
            saving: pkg.originalPrice && pkg.originalPrice > pkg.price ? Math.round(pkg.originalPrice - pkg.price) : 0,
            tourDateSlots: pkg.tourDateSlots, // Include tour date slots with room availability
        }

        // Cache for 60 seconds, stale-while-revalidate for 5 minutes
        return NextResponse.json(transformedPackage, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        })
    } catch (error) {
        console.error("Error fetching package:", error)
        return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { id } = await params
        const packageId = parseInt(id)
        const body = await request.json()

        const pkg = await prisma.package.update({
            where: { id: packageId },
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
                cities: body.cities,
                rating: body.rating,
            },
            include: {
                destination: true,
            },
        })

        // Sync TourDates and Room Configuration
        if (body.departureDates && body.roomConfig) {
            const dates = JSON.parse(body.departureDates)
            const roomConfig = body.roomConfig

            // Extract duration
            const durationMatch = (body.duration || pkg.duration || "").match(/(\d+)/)
            const durationDays = durationMatch ? parseInt(durationMatch[0]) : 1
            const currentYear = new Date().getFullYear()
            const processedIds: number[] = []

            for (const d of dates) {
                if (!d.date) continue

                // Parse Date: Handle YYYY-MM-DD and "Jan 28" legacy formats
                let startDate: Date
                // Basic YYYY-MM-DD check
                const isISO = /^\d{4}-\d{2}-\d{2}/.test(d.date)

                if (isISO) {
                    startDate = new Date(d.date)
                } else {
                    // Try parsing with current year appended if it looks like "Jan 28"
                    startDate = new Date(`${d.date} ${currentYear}`)
                    if (isNaN(startDate.getTime())) {
                        // Fallback to simpler parse
                        startDate = new Date(d.date)
                    }
                    // If still invalid, or year is 2001 default, adjust? 
                    if (startDate.getFullYear() === 2001) {
                        startDate.setFullYear(currentYear)
                    }
                }

                if (isNaN(startDate.getTime())) continue

                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + durationDays - 1)

                // Standardize label
                let dateLabel = d.date
                if (isISO) {
                    dateLabel = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                }

                // Upsert TourDate
                let td = await prisma.tourDate.findFirst({
                    where: {
                        packageId: packageId,
                        startDate: startDate, // Assumes startDate matches exactly (time 00:00:00)
                    }
                })

                // If not found by date, try finding by legacy label if applicable?
                // Safer to rely on date.

                if (!td) {
                    td = await prisma.tourDate.create({
                        data: {
                            packageId,
                            startDate,
                            endDate,
                            dateLabel,
                            price: d.price ? Number(d.price) : null,
                            totalSeats: d.seatsRemaining ? Number(d.seatsRemaining) : 20,
                            availableSeats: d.seatsRemaining ? Number(d.seatsRemaining) : 20,
                            isActive: true
                        }
                    })
                } else {
                    // Update basic info
                    await prisma.tourDate.update({
                        where: { id: td.id },
                        data: {
                            price: d.price ? Number(d.price) : td.price,
                            totalSeats: d.seatsRemaining ? Number(d.seatsRemaining) : td.totalSeats,
                            isActive: true
                        }
                    })
                }
                processedIds.push(td.id)

                // Sync Room Availability (Preserve Bookings)
                const dateSpecificConfig = d.roomConfig

                for (let type = 1; type <= 4; type++) {
                    // Logic: Specific Config -> Global Config -> Safety Fallback
                    let config = dateSpecificConfig?.[type]
                    if (!config) {
                        config = roomConfig[type] || { quantity: 10, price: 0 }
                    }

                    const qty = Number(config.quantity)
                    const price = Number(config.price)

                    const where = {
                        tourDateId_roomType: {
                            tourDateId: td.id,
                            roomType: type
                        }
                    }

                    const existingRa = await prisma.roomAvailability.findUnique({ where })

                    if (existingRa) {
                        const diff = qty - existingRa.totalRooms
                        await prisma.roomAvailability.update({
                            where,
                            data: {
                                totalRooms: qty,
                                availableRooms: { increment: diff },
                                pricePerRoom: price
                            }
                        })
                    } else {
                        await prisma.roomAvailability.create({
                            data: {
                                tourDateId: td.id,
                                roomType: type,
                                totalRooms: qty,
                                availableRooms: qty,
                                pricePerRoom: price
                            }
                        })
                    }
                }
            }

            // Prune inactive dates
            await prisma.tourDate.updateMany({
                where: {
                    packageId: packageId,
                    id: { notIn: processedIds },
                    startDate: { gte: new Date() }
                },
                data: { isActive: false }
            })
        }

        return NextResponse.json(pkg)
    } catch (error) {
        console.error("Error updating package:", error)
        return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { id } = await params
        const packageId = parseInt(id)

        await prisma.package.delete({
            where: { id: packageId },
        })

        return NextResponse.json({ message: "Package deleted successfully" })
    } catch (error) {
        console.error("Error deleting package:", error)
        return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
    }
}
