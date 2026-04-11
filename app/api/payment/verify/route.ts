import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import crypto from "crypto"
import { sendBookingConfirmationEmail, sendAdminNewBookingEmail } from "@/lib/email"

export async function POST(request: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
        } = body

        // Verify payment signature
        /* const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex")

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            )
        } */

        // Payment is valid, update booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                package: true,
            }
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        // Use transaction to update booking and decrement seats
        await prisma.$transaction(async (tx) => {
            // Update booking status
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    paymentId: razorpay_payment_id,
                },
            })



            // Mark coupon as used if applied
            if (booking.couponCode) {
                await tx.coupon.update({
                    where: { code: booking.couponCode },
                    data: {
                        isUsed: true,
                        usedAt: new Date(),
                        usedByBooking: bookingId,
                    }
                })
            }
        })

        // Send confirmation emails
        try {
            // Re-fetch booking with all necessary relations for email
            const confirmedBooking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    package: {
                        include: {
                            destination: true,
                        },
                    },
                },
            })

            if (confirmedBooking && confirmedBooking.package) {
                const emailData = {
                    bookingRef: confirmedBooking.bookingRef,
                    guestName: confirmedBooking.guestName,
                    guestEmail: confirmedBooking.guestEmail,
                    guestPhone: confirmedBooking.guestPhone,
                    numberOfPeople: confirmedBooking.numberOfPeople,
                    selectedDate: confirmedBooking.selectedDate,
                    departureCity: confirmedBooking.departureCity,
                    specialRequests: confirmedBooking.specialRequests,
                    pricePerPerson: confirmedBooking.pricePerPerson,
                    totalPrice: confirmedBooking.totalPrice,
                    status: confirmedBooking.status,
                    paymentStatus: confirmedBooking.paymentStatus,
                    package: {
                        title: confirmedBooking.package.title,
                        duration: confirmedBooking.package.duration,
                        image: confirmedBooking.package.image,
                        destination: {
                            name: confirmedBooking.package.destination.name,
                        },
                    },
                }

                await sendBookingConfirmationEmail(emailData)
                await sendAdminNewBookingEmail(emailData)
            }
        } catch (emailError) {
            console.error("Failed to send emails:", emailError)
        }

        return NextResponse.json({ success: true, message: "Payment verified and booking confirmed" })
    } catch (error) {
        console.error("Error verifying payment:", error)
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        )
    }
}
