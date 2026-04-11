import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic"


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

        const sale = await prisma.sale.findUnique({
            where: { id },
            include: {
                packages: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        image: true
                    }
                }
            }
        })

        if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

        return NextResponse.json(sale)
    } catch (error) {
        console.error("Error fetching sale:", error)
        return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

        const body = await request.json()
        const { name, slug, description, isActive, packageIds, heroImage } = body

        // Construct update data
        const data: any = {
            name,
            slug,
            description,
            isActive,
            heroImage
        }

        // Handle package connections if packageIds provided
        if (packageIds && Array.isArray(packageIds)) {
            // First disconnect all (or handle smart diffing, but simpler to set)
            // Ideally we want to set the relation. Prisma set replaces relations.
            data.packages = {
                set: packageIds.map((pid: number) => ({ id: pid }))
            }
        }

        const sale = await prisma.sale.update({
            where: { id },
            data,
            include: {
                packages: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        return NextResponse.json(sale)
    } catch (error) {
        console.error("Error updating sale:", error)
        return NextResponse.json({ error: "Failed to update sale" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

        await prisma.sale.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting sale:", error)
        return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 })
    }
}
