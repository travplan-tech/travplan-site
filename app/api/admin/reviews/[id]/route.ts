import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const body = await request.json()
        const { id } = await params
        const reviewId = parseInt(id)

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: {
                packageId: body.packageId,
                rating: body.rating,
                comment: body.comment,
                designation: body.designation,
                avatar: body.avatar,
                image: body.image,
                images: Array.isArray(body.images) ? body.images.join(",") : body.images,
                video: body.video,
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

        return NextResponse.json(review)
    } catch (error) {
        console.error("Error updating review:", error)
        return NextResponse.json(
            { error: "Failed to update review" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const { id } = await params
        const reviewId = parseInt(id)

        await prisma.review.delete({
            where: { id: reviewId },
        })

        return NextResponse.json({ message: "Review deleted successfully" })
    } catch (error) {
        console.error("Error deleting review:", error)
        return NextResponse.json(
            { error: "Failed to delete review" },
            { status: 500 }
        )
    }
}
