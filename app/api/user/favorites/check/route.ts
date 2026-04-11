import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/favorites/check?packageId=123 - Check if a package is favorited
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ favorited: false })
        }

        const packageId = request.nextUrl.searchParams.get("packageId")

        if (!packageId) {
            return NextResponse.json(
                { error: "packageId is required" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json({ favorited: false })
        }

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_packageId: {
                    userId: user.id,
                    packageId: parseInt(packageId),
                },
            },
        })

        return NextResponse.json({ favorited: !!favorite })
    } catch (error) {
        console.error("Error checking favorite:", error)
        return NextResponse.json({ favorited: false })
    }
}
