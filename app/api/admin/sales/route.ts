import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const sales = await prisma.sale.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { packages: true }
                }
            }
        })
        return NextResponse.json(sales)
    } catch (error) {
        console.error("Error fetching sales:", error)
        return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, slug, description, isActive } = body

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 })
        }

        const sale = await prisma.sale.create({
            data: {
                name,
                slug,
                description,
                isActive: isActive ?? false
            }
        })

        return NextResponse.json(sale)
    } catch (error) {
        console.error("Error creating sale:", error)
        return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
    }
}
