import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const reviews = await prisma.review.findMany({
            take: 100,
            select: {
                id: true,
                rating: true,
                comment: true,
                designation: true,
                avatar: true,
                image: true,
                images: true,
                video: true,
                destination: true,
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

        return NextResponse.json(reviews)
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
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const body = await request.json()

        let userId = body.userId
        let packageId = body.packageId

        // If packageName is provided without packageId, try to find package
        if (!packageId && body.packageName) {
            const existingPackage = await prisma.package.findFirst({
                where: { title: { contains: body.packageName, mode: 'insensitive' } }
            })

            if (existingPackage) {
                packageId = existingPackage.id
            } else {
                return NextResponse.json(
                    { error: "Package not found. Please select an existing package." },
                    { status: 400 }
                )
            }
        }

        // Validate packageId is present
        if (!packageId) {
            return NextResponse.json(
                { error: "Package is required" },
                { status: 400 }
            )
        }

        // Prepare data
        const reviewData: any = {
            rating: body.rating,
            comment: body.comment,
            designation: body.designation,
            avatar: body.avatar,
            image: body.image || (Array.isArray(body.images) && body.images.length > 0 ? body.images[0] : null),
            images: Array.isArray(body.images) ? body.images.join(",") : body.images,
            video: body.video,
            destination: body.destination,
            packageId: packageId,
        }

        // Handle User: Link to existing user if ID provided, otherwise store name
        if (userId) {
            reviewData.userId = userId
        } else if (body.userName) {
            reviewData.userName = body.userName
        } else {
            return NextResponse.json(
                { error: "User selection or Name is required" },
                { status: 400 }
            )
        }

        // Create Review
        const review = await prisma.review.create({
            data: reviewData,
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

        return NextResponse.json(review, { status: 201 })
    } catch (error) {
        console.error("Error creating review:", error)
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        )
    }
}
