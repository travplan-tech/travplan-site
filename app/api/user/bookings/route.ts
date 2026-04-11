import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

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

        // Fetch user's reviews to check which bookings they've already reviewed
        const reviews = await prisma.review.findMany({
            where: { userId: user.id },
            select: { packageId: true, bookingId: true }
        })

        // Create sets for both booking-specific reviews and package-level reviews
        const reviewedBookingIds = new Set(reviews.filter(r => r.bookingId).map(r => r.bookingId))
        const reviewedPackageIds = new Set(reviews.filter(r => !r.bookingId).map(r => r.packageId))

        const bookingsWithReviewStatus = bookings.map(booking => ({
            ...booking,
            // A booking has been reviewed if:
            // 1. There's a review specifically for this booking (bookingId match), OR
            // 2. There's an old-style review for this package without bookingId (for backward compatibility)
            hasReviewed: reviewedBookingIds.has(booking.id) ||
                (booking.packageId && reviewedPackageIds.has(booking.packageId) && !reviews.some(r => r.bookingId))
        }))

        return NextResponse.json(bookingsWithReviewStatus)
    } catch (error) {
        console.error("Error fetching user bookings:", error)
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }
}
