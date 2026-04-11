import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        // Find the most recently created ACTIVE sale
        const activeSale = await prisma.sale.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        })

        if (!activeSale) {
            return NextResponse.json(null, {
                headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
            })
        }

        return NextResponse.json({
            name: activeSale.name,
            slug: activeSale.slug,
            isActive: true
        }, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
        })
    } catch (error) {
        console.error("Error fetching active sale:", error)
        return NextResponse.json({ error: "Failed to fetch active sale" }, { status: 500 })
    }
}
