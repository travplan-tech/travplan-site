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
        const destinationId = parseInt(id)

        const destination = await prisma.destination.update({
            where: { id: destinationId },
            data: {
                name: body.name,
                description: body.description,
                country: body.country,
                city: body.city || null,
                region: body.region,
                image: body.image,
                tours: body.tours || 0,
            },
        })

        return NextResponse.json(destination)
    } catch (error) {
        console.error("Error updating destination:", error)
        return NextResponse.json(
            { error: "Failed to update destination" },
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
        const destinationId = parseInt(id)

        await prisma.destination.delete({
            where: { id: destinationId },
        })

        return NextResponse.json({ message: "Destination deleted successfully" })
    } catch (error) {
        console.error("Error deleting destination:", error)
        return NextResponse.json(
            { error: "Failed to delete destination" },
            { status: 500 }
        )
    }
}
