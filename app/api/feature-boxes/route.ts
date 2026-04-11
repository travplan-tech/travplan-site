import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Public API to fetch active feature boxes
export async function GET() {
    try {
        const featureBoxes = await prisma.featureBox.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: {
                id: true,
                title: true,
                description: true,
                icon: true,
            }
        })

        // Cache for 5 minutes, stale-while-revalidate for 1 hour (rarely changes)
        return NextResponse.json(featureBoxes, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
            }
        })
    } catch (error) {
        console.error("Error fetching feature boxes:", error)
        return NextResponse.json(
            { error: "Failed to fetch feature boxes" },
            { status: 500 }
        )
    }
}
