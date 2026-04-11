import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
    try {
        const { error, status } = await requireAdmin()
        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const enquiries = await prisma.enquiry.findMany({
            take: 100,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                packageId: true,
                packageName: true,
                message: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(enquiries)
    } catch (error) {
        console.error("Error fetching enquiries:", error)
        return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 })
    }
}
