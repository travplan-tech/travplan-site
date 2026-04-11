import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ref: string }> }
) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const { ref } = await params

        const booking = await prisma.booking.findFirst({
            where: {
                bookingRef: ref,
                userId: user.id
            },
            include: {
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
