import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

interface RoomConfig {
    roomType: number
    totalRooms: number
    pricePerRoom: number
}

interface TourDateInput {
    packageId: number
    startDate: string
    endDate: string
    dateLabel: string
    price?: number | null
    totalSeats: number
    isActive?: boolean
    roomConfig?: RoomConfig[]
}

// GET - Get tour dates for a package
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const packageId = searchParams.get("packageId")

        if (!packageId) {
            return NextResponse.json({ error: "Package ID required" }, { status: 400 })
        }

        const tourDates = await prisma.tourDate.findMany({
            where: { packageId: parseInt(packageId) },
            include: {
                roomAvailability: {
                    orderBy: { roomType: "asc" }
                }
            },
            orderBy: { startDate: "asc" }
        })

        return NextResponse.json(tourDates)
    } catch (error) {
        console.error("Error fetching tour dates:", error)
        return NextResponse.json({ error: "Failed to fetch tour dates" }, { status: 500 })
    }
}

// POST - Create a new tour date with room availability
export async function POST(request: Request) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const body: TourDateInput = await request.json()

        if (!body.packageId || !body.startDate || !body.endDate || !body.dateLabel) {
            return NextResponse.json(
                { error: "Package ID, start date, end date, and date label are required" },
                { status: 400 }
            )
        }

        // Create tour date with room availability in a transaction
        const tourDate = await prisma.$transaction(async (tx) => {
            // Create the tour date
            const newTourDate = await tx.tourDate.create({
                data: {
                    packageId: body.packageId,
                    startDate: new Date(body.startDate),
                    endDate: new Date(body.endDate),
                    dateLabel: body.dateLabel,
                    price: body.price || null,
                    totalSeats: body.totalSeats || 20,
                    availableSeats: body.totalSeats || 20,
                    isActive: body.isActive !== false
                }
            })

            // Create room availability records if provided
            if (body.roomConfig && body.roomConfig.length > 0) {
                await tx.roomAvailability.createMany({
                    data: body.roomConfig.map(room => ({
                        tourDateId: newTourDate.id,
                        roomType: room.roomType,
                        totalRooms: room.totalRooms,
                        availableRooms: room.totalRooms,
                        pricePerRoom: room.pricePerRoom
                    }))
                })
            }

            // Fetch the complete tour date with room availability
            return await tx.tourDate.findUnique({
                where: { id: newTourDate.id },
                include: {
                    roomAvailability: {
                        orderBy: { roomType: "asc" }
                    }
                }
            })
        })

        return NextResponse.json(tourDate, { status: 201 })
    } catch (error) {
        console.error("Error creating tour date:", error)
        return NextResponse.json({ error: "Failed to create tour date" }, { status: 500 })
    }
}

// PUT - Update a tour date
export async function PUT(request: Request) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const body = await request.json()
        const { id, roomConfig, ...tourDateData } = body

        if (!id) {
            return NextResponse.json({ error: "Tour date ID required" }, { status: 400 })
        }

        const tourDate = await prisma.$transaction(async (tx) => {
            // Update the tour date
            const updatedTourDate = await tx.tourDate.update({
                where: { id },
                data: {
                    ...(tourDateData.startDate && { startDate: new Date(tourDateData.startDate) }),
                    ...(tourDateData.endDate && { endDate: new Date(tourDateData.endDate) }),
                    ...(tourDateData.dateLabel && { dateLabel: tourDateData.dateLabel }),
                    ...(tourDateData.price !== undefined && { price: tourDateData.price }),
                    ...(tourDateData.totalSeats !== undefined && {
                        totalSeats: tourDateData.totalSeats,
                        availableSeats: tourDateData.availableSeats ?? tourDateData.totalSeats
                    }),
                    ...(tourDateData.isActive !== undefined && { isActive: tourDateData.isActive })
                }
            })

            // If room config is provided, update room availability
            if (roomConfig && Array.isArray(roomConfig)) {
                // Delete existing room availability
                await tx.roomAvailability.deleteMany({
                    where: { tourDateId: id }
                })

                // Create new room availability records
                if (roomConfig.length > 0) {
                    await tx.roomAvailability.createMany({
                        data: roomConfig.map((room: RoomConfig) => ({
                            tourDateId: id,
                            roomType: room.roomType,
                            totalRooms: room.totalRooms,
                            availableRooms: room.totalRooms,
                            pricePerRoom: room.pricePerRoom
                        }))
                    })
                }
            }

            return await tx.tourDate.findUnique({
                where: { id },
                include: {
                    roomAvailability: {
                        orderBy: { roomType: "asc" }
                    }
                }
            })
        })

        return NextResponse.json(tourDate)
    } catch (error) {
        console.error("Error updating tour date:", error)
        return NextResponse.json({ error: "Failed to update tour date" }, { status: 500 })
    }
}

// DELETE - Delete a tour date
export async function DELETE(request: Request) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Tour date ID required" }, { status: 400 })
        }

        await prisma.tourDate.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting tour date:", error)
        return NextResponse.json({ error: "Failed to delete tour date" }, { status: 500 })
    }
}
