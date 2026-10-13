import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
    try {
        const { user, error, status } = await requireAdmin()
        if (error || !user) {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error("Error fetching contact messages:", error)
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        )
    }
}
