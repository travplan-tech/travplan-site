import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    try {
        const { slug } = params

        const sale = await prisma.sale.findUnique({
            where: { slug },
            include: {
                packages: {
                    take: 1 // Just check if any packages exist, fetching usually done by BestTours via separate API
                }
            }
        })

        if (!sale || !sale.isActive) {
            return NextResponse.json({ error: "Sale not found" }, { status: 404 })
        }

        return NextResponse.json(sale, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
        })
    } catch (error) {
        console.error("Error fetching sale:", error)
        return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 })
    }
}
