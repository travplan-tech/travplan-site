import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Fetch single expert
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const expert = await prisma.tripExpert.findUnique({
            where: { id: parseInt(id) },
        })

        if (!expert) {
            return NextResponse.json(
                { error: "Expert not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...expert,
            expertise: expert.expertise ? expert.expertise.split(",").map((e) => e.trim()) : [],
        })
    } catch (error) {
        console.error("Failed to fetch expert:", error)
        return NextResponse.json(
            { error: "Failed to fetch expert" },
            { status: 500 }
        )
    }
}

// PUT - Update expert (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, email, avatar, bio, expertise, whatsappNumber, type, isActive, order } = body

        // Convert expertise array to comma-separated string if it's an array
        const expertiseString = Array.isArray(expertise)
            ? expertise.join(", ")
            : expertise

        const expert = await prisma.tripExpert.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(email !== undefined && { email }),
                ...(avatar !== undefined && { avatar }),
                ...(bio !== undefined && { bio }),
                ...(expertiseString !== undefined && { expertise: expertiseString }),
                ...(whatsappNumber !== undefined && { whatsappNumber }),
                ...(type && { type: type.toUpperCase() }),
                ...(isActive !== undefined && { isActive }),
                ...(order !== undefined && { order }),
            },
        })

        return NextResponse.json(expert)
    } catch (error) {
        console.error("Failed to update expert:", error)
        return NextResponse.json(
            { error: "Failed to update expert" },
            { status: 500 }
        )
    }
}

// DELETE - Delete expert (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        await prisma.tripExpert.delete({
            where: { id: parseInt(id) },
        })

        return NextResponse.json({ message: "Expert deleted successfully" })
    } catch (error) {
        console.error("Failed to delete expert:", error)
        return NextResponse.json(
            { error: "Failed to delete expert" },
            { status: 500 }
        )
    }
}
