import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

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
        const subscriptionId = parseInt(id)

        await prisma.newsletterSubscription.delete({
            where: { id: subscriptionId },
        })

        return NextResponse.json({ message: "Subscription deleted successfully" })
    } catch (error) {
        console.error("Error deleting subscription:", error)
        return NextResponse.json(
            { error: "Failed to delete subscription" },
            { status: 500 }
        )
    }
}
