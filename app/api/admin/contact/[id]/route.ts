import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

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
        const messageId = parseInt(id)
        const body = await request.json()

        const updatedMessage = await prisma.contactMessage.update({
            where: { id: messageId },
            data: { status: body.status },
        })

        return NextResponse.json(updatedMessage)
    } catch (error) {
        console.error("Error updating message:", error)
        return NextResponse.json(
            { error: "Failed to update message" },
            { status: 500 }
        )
    }
}

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
        const messageId = parseInt(id)
        const body = await request.json()

        const updatedMessage = await prisma.contactMessage.update({
            where: { id: messageId },
            data: { status: body.status },
        })

        return NextResponse.json(updatedMessage)
    } catch (error) {
        console.error("Error updating message:", error)
        return NextResponse.json(
            { error: "Failed to update message" },
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
        const messageId = parseInt(id)

        await prisma.contactMessage.delete({
            where: { id: messageId },
        })

        return NextResponse.json({ message: "Message deleted successfully" })
    } catch (error) {
        console.error("Error deleting message:", error)
        return NextResponse.json(
            { error: "Failed to delete message" },
            { status: 500 }
        )
    }
}
