import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/favorites - Get user's favorite packages
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: {
                package: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        price: true,
                        originalPrice: true,
                        duration: true,
                        rating: true,
                        tourType: true,
                        tourCategory: true,
                        destination: {
                            select: {
                                name: true,
                                country: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(favorites)
    } catch (error) {
        console.error("Error fetching favorites:", error)
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        )
    }
}

// POST /api/user/favorites - Toggle favorite (add/remove)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { packageId } = body

        if (!packageId || typeof packageId !== "number") {
            return NextResponse.json(
                { error: "Valid packageId is required" },
                { status: 400 }
            )
        }

        // Check if package exists
        const pkg = await prisma.package.findUnique({
            where: { id: packageId },
        })

        if (!pkg) {
            return NextResponse.json(
                { error: "Package not found" },
                { status: 404 }
            )
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_packageId: {
                    userId: user.id,
                    packageId,
                },
            },
        })

        if (existing) {
            // Remove from favorites
            await prisma.favorite.delete({
                where: { id: existing.id },
            })
            return NextResponse.json({ favorited: false, message: "Removed from favorites" })
        } else {
            // Add to favorites
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    packageId,
                },
            })
            return NextResponse.json({ favorited: true, message: "Added to favorites" })
        }
    } catch (error) {
        console.error("Error toggling favorite:", error)
        return NextResponse.json(
            { error: "Failed to toggle favorite" },
            { status: 500 }
        )
    }
}
