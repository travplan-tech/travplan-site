import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") || "video"
        const limit = parseInt(searchParams.get("limit") || "12")

        const where: any = {}

        if (type === "video") {
            where.video = { not: null }
        } else if (type === "photo") {
            where.image = { not: null }
        }

        const reviews = await prisma.review.findMany({
            where,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                rating: true,
                comment: true,
                image: true,
                images: true,
                video: true,
                destination: true,
                userName: true,
                createdAt: true,
                user: {
                    select: { name: true }
                }
            }
        })

        const cacheHeaders = {
            'Cache-Control': 'no-store, max-age=0',
        }

        if (type === "photo") {
            const allPhotos: any[] = [];
            reviews.forEach(r => {
                const reviewerName = r.user?.name || r.userName || "Traveler";
                // @ts-ignore
                if (r.images) {
                    // @ts-ignore
                    const imgs = r.images.split(",");
                    imgs.forEach((img: string, idx: number) => {
                        allPhotos.push({
                            id: `${r.id}-${idx}`,
                            image: img.trim(),
                            title: r.comment ? r.comment.substring(0, 50) : "Traveler Photo",
                            name: reviewerName
                        });
                    });
                } else if (r.image) {
                    allPhotos.push({
                        id: r.id,
                        image: r.image,
                        title: r.comment ? r.comment.substring(0, 50) : "Traveler Photo",
                        name: reviewerName
                    });
                }
            });
            return NextResponse.json(allPhotos.slice(0, limit), { headers: cacheHeaders })
        }

        const formatted = reviews.map(r => ({
            id: r.id,
            video: r.video!,
            name: r.user?.name || r.userName || "Traveler",
            destination: r.destination || "Unknown"
        }))

        return NextResponse.json(formatted, { headers: cacheHeaders })
    } catch (error) {
        console.error("Error fetching reviews:", error)
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const body = await request.json()
        const { packageId, rating, comment, images, video, bookingRef } = body

        if (!packageId || !rating || !comment) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Resolve bookingRef to bookingId if provided
        let bookingId: number | null = null
        if (bookingRef) {
            const booking = await prisma.booking.findUnique({
                where: { bookingRef }
            })
            if (booking && booking.userId === user.id) {
                bookingId = booking.id
            }
        }

        // Check if already reviewed - check by bookingId if available, otherwise by packageId
        if (bookingId) {
            // Check if this specific booking has been reviewed
            const existingByBooking = await prisma.review.findFirst({
                where: {
                    userId: user.id,
                    bookingId: bookingId
                }
            })
            if (existingByBooking) {
                return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 400 })
            }
        } else {
            // Legacy check: if no bookingId, check by packageId only
            const existingByPackage = await prisma.review.findFirst({
                where: {
                    userId: user.id,
                    packageId: Number(packageId),
                    bookingId: null // Only check reviews without bookingId
                }
            })
            if (existingByPackage) {
                return NextResponse.json({ error: "You have already reviewed this package" }, { status: 400 })
            }
        }

        // Handle images: if array, join with comma. if string, use as is.
        let imagesString = null;
        if (Array.isArray(images)) {
            imagesString = images.join(",");
        } else if (typeof images === "string") {
            imagesString = images;
        }

        const review = await prisma.review.create({
            data: {
                userId: user.id,
                packageId: Number(packageId),
                bookingId: bookingId,
                rating: Number(rating),
                comment: comment,
                images: imagesString,
                image: imagesString ? imagesString.split(",")[0] : null, // Set primary image for backward compat
                video: video,
                // Optional fields
                avatar: user.image,
                designation: "Verified Traveler"
            }
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error("Error creating review:", error)
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }
}
