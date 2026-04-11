import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import Razorpay from "razorpay"

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID!,
//     key_secret: process.env.RAZORPAY_KEY_SECRET!,
// })

export async function POST(request: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const body = await request.json()
        const { bookingId } = body

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        // Amount in paisa (smallest currency unit)
        const amount = Math.round(booking.totalPrice * 100)

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `booking_${bookingId}`,
            notes: {
                bookingId: bookingId.toString(),
                bookingRef: booking.bookingRef,
            }
        }

        // const order = await razorpay.orders.create(options)

        // Update booking with payment disabled status or return error
        return NextResponse.json(
            { error: "Online payments are currently disabled" },
            { status: 503 }
        )

        // Update booking with order ID
        /* await prisma.booking.update({
            where: { id: bookingId },
            data: { orderId: order.id }
        })

        return NextResponse.json(order) */
    } catch (error) {
        console.error("Error creating payment order:", error)
        return NextResponse.json(
            { error: "Failed to create payment order" },
            { status: 500 }
        )
    }
}
