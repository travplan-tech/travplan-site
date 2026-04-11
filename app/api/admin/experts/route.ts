import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Fetch all trip experts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") // DOMESTIC or INTERNATIONAL
        const all = searchParams.get("all") // If "true", return all experts including inactive (for admin)

        const whereClause: { isActive?: boolean; type?: string } = {}

        // Only filter by isActive for public requests (when all is not "true")
        if (all !== "true") {
            whereClause.isActive = true
        }

        if (type) {
            whereClause.type = type.toUpperCase()
        }

        const experts = await prisma.tripExpert.findMany({
            where: whereClause,
            orderBy: { order: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                expertise: true,
                whatsappNumber: true,
                type: true,
                isActive: true,
                order: true,
                createdAt: true,
            }
        })

        // Parse expertise from comma-separated string to array
        const formattedExperts = experts.map((expert) => ({
            ...expert,
            expertise: expert.expertise ? expert.expertise.split(",").map((e) => e.trim()) : [],
        }))

        return NextResponse.json(formattedExperts, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
        })
    } catch (error) {
        console.error("Failed to fetch experts:", error)
        return NextResponse.json(
            { error: "Failed to fetch experts" },
            { status: 500 }
        )
    }
}

// POST - Create a new trip expert (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, avatar, bio, expertise, whatsappNumber, type, isActive, order } = body

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        // Convert expertise array to comma-separated string if it's an array
        const expertiseString = Array.isArray(expertise)
            ? expertise.join(", ")
            : expertise || ""

        const expert = await prisma.tripExpert.create({
            data: {
                name,
                email: email || null,
                avatar: avatar || null,
                bio: bio || null,
                expertise: expertiseString,
                whatsappNumber: whatsappNumber || null,
                type: type?.toUpperCase() || "INTERNATIONAL",
                isActive: isActive !== undefined ? isActive : true,
                order: order || 0,
            },
        })

        return NextResponse.json(expert, { status: 201 })
    } catch (error) {
        console.error("Failed to create expert:", error)
        return NextResponse.json(
            { error: "Failed to create expert" },
            { status: 500 }
        )
    }
}
