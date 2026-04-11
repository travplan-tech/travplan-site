import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, phone, image } = body

        // At least name should be provided
        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        // Build update data
        const updateData: { name: string; phone?: string | null; image?: string | null } = {
            name: name.trim(),
        }

        // Handle phone - allow null/empty to clear it
        if (phone !== undefined) {
            updateData.phone = phone?.trim() || null
        }

        // Handle image - allow null/empty to clear it
        if (image !== undefined) {
            updateData.image = image?.trim() || null
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Failed to update profile:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}

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
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Failed to get profile:", error)
        return NextResponse.json(
            { error: "Failed to get profile" },
            { status: 500 }
        )
    }
}
