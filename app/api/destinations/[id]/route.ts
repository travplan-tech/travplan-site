import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const destinationId = parseInt(id)

        if (isNaN(destinationId)) {
            return NextResponse.json(
                { error: "Invalid destination ID" },
                { status: 400 }
            )
        }

        const destination = await prisma.destination.findUnique({
            where: { id: destinationId },
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
            }
        })

        if (!destination) {
            return NextResponse.json(
                { error: "Destination not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(destination)
    } catch (error) {
        console.error("Error fetching destination:", error)
        return NextResponse.json(
            { error: "Failed to fetch destination" },
            { status: 500 }
        )
    }
}
