import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        // Limit to 100 most recent bookings for performance
        const bookings = await prisma.booking.findMany({
            take: 100,
            select: {
                id: true,
                bookingRef: true,
                guestName: true,
                guestEmail: true,
                guestPhone: true,
                numberOfPeople: true,
                selectedDate: true,
                departureCity: true,
                specialRequests: true,
                pricePerPerson: true,
                totalPrice: true,
                status: true,
                paymentStatus: true,
                paymentId: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                package: {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        destination: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error("Error fetching bookings:", error)
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }
}
