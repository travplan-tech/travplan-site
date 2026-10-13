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

        const subscriptions = await prisma.newsletterSubscription.findMany({
            orderBy: { subscribedAt: "desc" },
        })

        return NextResponse.json(subscriptions)
    } catch (error) {
        console.error("Error fetching newsletter subscriptions:", error)
        return NextResponse.json(
            { error: "Failed to fetch subscriptions" },
            { status: 500 }
        )
    }
}
