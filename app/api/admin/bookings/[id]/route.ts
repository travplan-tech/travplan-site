import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { id } = await params
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                package: {
                    include: { destination: true },
                },
                tourDate: true,
            },
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        return NextResponse.json(booking)
    } catch (error) {
        console.error("Error fetching booking:", error)
        return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
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
        const body = await request.json()

        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: {
                status: body.status,
                paymentStatus: body.paymentStatus,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                package: {
                    include: { destination: true },
                },
            },
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error("Error updating booking:", error)
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
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

        // Get booking to restore seats if needed
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
        })

        if (booking && booking.tourDateId && booking.paymentStatus === "PAID") {
            // Restore seats if booking was paid
            await prisma.tourDate.update({
                where: { id: booking.tourDateId },
                data: {
                    availableSeats: {
                        increment: booking.numberOfPeople
                    }
                }
            })
        }

        await prisma.booking.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting booking:", error)
        return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
    }
}
