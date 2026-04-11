import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { id } = await params
        const enquiry = await prisma.enquiry.findUnique({
            where: { id: parseInt(id) }
        })

        if (!enquiry) {
            return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
        }

        return NextResponse.json(enquiry)
    } catch (error) {
        console.error("Error fetching enquiry:", error)
        return NextResponse.json({ error: "Failed to fetch enquiry" }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { id } = await params
        const body = await request.json()

        const enquiry = await prisma.enquiry.update({
            where: { id: parseInt(id) },
            data: {
                status: body.status
            }
        })

        return NextResponse.json(enquiry)
    } catch (error) {
        console.error("Error updating enquiry:", error)
        return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { id } = await params
        await prisma.enquiry.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting enquiry:", error)
        return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 })
    }
}
