import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const destinations = await prisma.destination.findMany({
            take: 100,
            select: {
                id: true,
                name: true,
                description: true,
                country: true,
                city: true,
                region: true,
                image: true,
                rating: true,
                popularity: true,
                tours: true,
                createdAt: true,
                _count: {
                    select: {
                        packages: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(destinations)
    } catch (error) {
        console.error("Error fetching destinations:", error)
        return NextResponse.json(
            { error: "Failed to fetch destinations" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const body = await request.json()

        const destination = await prisma.destination.create({
            data: {
                name: body.name,
                description: body.description,
                country: body.country,
                city: body.city || null,
                region: body.region,
                image: body.image,
                tours: body.tours || 0,
            },
        })

        return NextResponse.json(destination, { status: 201 })
    } catch (error) {
        console.error("Error creating destination:", error)
        return NextResponse.json(
            { error: "Failed to create destination" },
            { status: 500 }
        )
    }
}
