import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

// GET - List all feature boxes
export async function GET() {
    try {
        const featureBoxes = await prisma.featureBox.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                icon: true,
                order: true,
                isActive: true,
            },
            orderBy: { order: "asc" },
        })

        return NextResponse.json(featureBoxes)
    } catch (error) {
        console.error("Error fetching feature boxes:", error)
        return NextResponse.json(
            { error: "Failed to fetch feature boxes" },
            { status: 500 }
        )
    }
}

// POST - Create new feature box
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

        const featureBox = await prisma.featureBox.create({
            data: {
                title: body.title,
                description: body.description,
                icon: body.icon,
                order: body.order || 0,
                isActive: body.isActive ?? true,
            },
        })

        return NextResponse.json(featureBox, { status: 201 })
    } catch (error) {
        console.error("Error creating feature box:", error)
        return NextResponse.json(
            { error: "Failed to create feature box" },
            { status: 500 }
        )
    }
}
