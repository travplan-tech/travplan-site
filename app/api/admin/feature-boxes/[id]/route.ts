import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

// PUT - Update feature box
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

        const { id } = await params
        const featureBoxId = parseInt(id)
        const body = await request.json()

        const featureBox = await prisma.featureBox.update({
            where: { id: featureBoxId },
            data: {
                title: body.title,
                description: body.description,
                icon: body.icon,
                order: body.order,
                isActive: body.isActive,
            },
        })

        return NextResponse.json(featureBox)
    } catch (error) {
        console.error("Error updating feature box:", error)
        return NextResponse.json(
            { error: "Failed to update feature box" },
            { status: 500 }
        )
    }
}

// PATCH - Toggle active status
export async function PATCH(
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
        const featureBoxId = parseInt(id)
        const body = await request.json()

        const featureBox = await prisma.featureBox.update({
            where: { id: featureBoxId },
            data: { isActive: body.isActive },
        })

        return NextResponse.json(featureBox)
    } catch (error) {
        console.error("Error updating feature box status:", error)
        return NextResponse.json(
            { error: "Failed to update feature box status" },
            { status: 500 }
        )
    }
}

// DELETE - Remove feature box
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
        const featureBoxId = parseInt(id)

        await prisma.featureBox.delete({
            where: { id: featureBoxId },
        })

        return NextResponse.json({ message: "Feature box deleted successfully" })
    } catch (error) {
        console.error("Error deleting feature box:", error)
        return NextResponse.json(
            { error: "Failed to delete feature box" },
            { status: 500 }
        )
    }
}
