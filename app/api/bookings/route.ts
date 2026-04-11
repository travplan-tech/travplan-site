import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { sendAdminPendingPaymentEmail, sendCustomerPendingPaymentEmail } from "@/lib/email"

export async function GET() {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const bookings = await prisma.booking.findMany({
            where: { userId: user.id },
            include: {
                package: {
                    include: { destination: true },
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

interface RoomSelection {
    roomType: number
    count: number
    pricePerRoom: number
}

export async function POST(request: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const body = await request.json()

        // Validate required fields
        const requiredFields = ["packageId", "guestName", "guestEmail", "guestPhone", "numberOfPeople", "selectedDate", "departureCity"]
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Get package details
        const pkg = await prisma.package.findUnique({
            where: { id: body.packageId },
            include: {
                destination: true,
            },
        })

        if (!pkg) {
            return NextResponse.json(
                { error: "Package not found" },
                { status: 404 }
            )
        }

        // Check seat availability if tourDateId is provided
        let tourDate = null
        let pricePerPerson = pkg.price

        if (body.tourDateId) {
            tourDate = await prisma.tourDate.findUnique({
                where: { id: body.tourDateId },
                include: {
                    roomAvailability: true
                }
            })

            if (!tourDate) {
                return NextResponse.json(
                    { error: "Tour date not found" },
                    { status: 404 }
                )
            }

            if (tourDate.availableSeats < body.numberOfPeople) {
                return NextResponse.json(
                    {
                        error: `Not enough seats available. Only ${tourDate.availableSeats} seats remaining.`,
                        availableSeats: tourDate.availableSeats
                    },
                    { status: 400 }
                )
            }

            if (tourDate.price) {
                pricePerPerson = tourDate.price
            }

            // Validate room selection if provided
            if (body.roomSelection) {
                let roomSelection: RoomSelection[]
                try {
                    roomSelection = typeof body.roomSelection === 'string'
                        ? JSON.parse(body.roomSelection)
                        : body.roomSelection
                } catch {
                    return NextResponse.json(
                        { error: "Invalid room selection format" },
                        { status: 400 }
                    )
                }

                // Verify that room selection equals number of travelers
                const totalCapacity = roomSelection.reduce((sum, room) => sum + (room.roomType * room.count), 0)
                if (totalCapacity !== body.numberOfPeople) {
                    return NextResponse.json(
                        { error: `Room selection capacity (${totalCapacity}) does not match number of travelers (${body.numberOfPeople})` },
                        { status: 400 }
                    )
                }

                // Verify room availability
                for (const room of roomSelection) {
                    const availability = tourDate.roomAvailability.find(r => r.roomType === room.roomType)
                    if (!availability) {
                        return NextResponse.json(
                            { error: `Room type ${room.roomType} is not available for this date` },
                            { status: 400 }
                        )
                    }
                    if (availability.availableRooms < room.count) {
                        return NextResponse.json(
                            { error: `Not enough ${room.roomType}-seater rooms available. Only ${availability.availableRooms} remaining.` },
                            { status: 400 }
                        )
                    }
                }
            }
        } else if (body.selectedDate && pkg.departureDates) {
            // Fallback: Check JSON departure dates if relation is not used
            try {
                const dates = JSON.parse(pkg.departureDates)
                const departure = dates.find((d: any) => d.date === body.selectedDate)

                if (departure) {
                    // Check seat availability
                    if (typeof departure.seatsRemaining === 'number' && departure.seatsRemaining < body.numberOfPeople) {
                        return NextResponse.json(
                            {
                                error: `Not enough seats available. Only ${departure.seatsRemaining} seats remaining.`,
                                availableSeats: departure.seatsRemaining
                            },
                            { status: 400 }
                        )
                    }

                    if (departure.price) {
                        pricePerPerson = departure.price
                    }
                }
            } catch (e) {
                console.error("Failed to parse departure dates for pricing", e)
            }
        }

        let totalPrice = pricePerPerson * body.numberOfPeople
        let roomTotalPrice = 0
        let discountAmount = 0

        // Calculate room total price
        if (body.roomSelection && body.roomTotalPrice) {
            roomTotalPrice = body.roomTotalPrice
            totalPrice += roomTotalPrice
        }

        // Validate and apply coupon
        if (body.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: body.couponCode },
            })

            if (coupon) {
                // Basic validation (comprehensive validation should happen in /api/coupons/apply or duplicated here)
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                const isUsed = coupon.isUsed

                // Ownership check
                const isOwner = (coupon.userId && coupon.userId === user.id) ||
                    (!coupon.userId && coupon.email && coupon.email === user.email) ||
                    (!coupon.userId && !coupon.email) // Public coupon

                if (!isExpired && !isUsed && isOwner) {
                    if (coupon.discountType === "PERCENTAGE") {
                        discountAmount = (totalPrice * coupon.discountValue) / 100
                    } else {
                        discountAmount = coupon.discountValue
                    }
                    // Cap discount
                    if (discountAmount > totalPrice) discountAmount = totalPrice
                }
            }
        }

        const finalPrice = totalPrice - discountAmount

        // Use a transaction to create booking and update room availability atomically
        const booking = await prisma.$transaction(async (tx) => {
            // Create booking
            const newBooking = await tx.booking.create({
                data: {
                    userId: user.id,
                    packageId: body.packageId,
                    tourDateId: body.tourDateId || null,
                    guestName: body.guestName,
                    guestEmail: body.guestEmail,
                    guestPhone: body.guestPhone,
                    numberOfPeople: body.numberOfPeople,
                    travelerNames: body.travelerNames ? body.travelerNames.join(", ") : body.guestName,
                    selectedDate: body.selectedDate,
                    departureCity: body.departureCity,
                    specialRequests: body.specialRequests || null,
                    pricePerPerson: pricePerPerson,
                    totalPrice: finalPrice,
                    discountAmount: discountAmount,
                    couponCode: body.couponCode || null,
                    roomSelection: body.roomSelection || null,
                    roomTotalPrice: roomTotalPrice || 0,
                    status: "PENDING",
                    paymentStatus: "UNPAID",
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
                        include: {
                            destination: true,
                        },
                    },
                },
            })

            // Update room availability if room selection was made
            if (body.tourDateId && body.roomSelection) {
                let roomSelection: RoomSelection[]
                try {
                    roomSelection = typeof body.roomSelection === 'string'
                        ? JSON.parse(body.roomSelection)
                        : body.roomSelection
                } catch {
                    roomSelection = []
                }

                for (const room of roomSelection) {
                    await tx.roomAvailability.update({
                        where: {
                            tourDateId_roomType: {
                                tourDateId: Number(body.tourDateId),
                                roomType: Number(room.roomType)
                            }
                        },
                        data: {
                            availableRooms: {
                                decrement: Number(room.count)
                            }
                        }
                    })
                }
            }

            // Decrement available seats (Always if tourDateId exists)
            if (body.tourDateId) {
                await tx.tourDate.update({
                    where: { id: body.tourDateId },
                    data: {
                        availableSeats: {
                            decrement: Number(body.numberOfPeople)
                        }
                    }
                })
            }

            return newBooking
        })

        // Send emails (Razorpay disabled - pending payment flow)
        try {
            if (!booking.package) {
                console.error("Package data not included in booking")
            } else {
                const emailData = {
                    bookingRef: booking.bookingRef,
                    guestName: booking.guestName,
                    guestEmail: booking.guestEmail,
                    guestPhone: booking.guestPhone,
                    numberOfPeople: booking.numberOfPeople,
                    selectedDate: booking.selectedDate,
                    departureCity: booking.departureCity,
                    specialRequests: booking.specialRequests,
                    pricePerPerson: booking.pricePerPerson,
                    totalPrice: booking.totalPrice,
                    status: booking.status,
                    paymentStatus: booking.paymentStatus,
                    roomSelection: booking.roomSelection,
                    roomTotalPrice: booking.roomTotalPrice || undefined,
                    package: {
                        title: booking.package.title,
                        duration: booking.package.duration,
                        image: booking.package.image,
                        destination: {
                            name: booking.package.destination.name,
                        },
                    },
                }

                // Send email to admin for payment collection
                await sendAdminPendingPaymentEmail(emailData)

                // Send confirmation email to customer
                await sendCustomerPendingPaymentEmail(emailData)
            }
        } catch (emailError) {
            console.error("Failed to send pending payment emails:", emailError)
            // Don't fail the booking creation if emails fail
        }

        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        console.error("Error creating booking:", error)
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }
}
