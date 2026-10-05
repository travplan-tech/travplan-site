import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Public blog listing. Only published posts are returned; drafts are visible
 * through the admin API.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const destinationId = searchParams.get("destinationId")
        const tag = searchParams.get("tag")
        const limitParam = Number(searchParams.get("limit"))
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : undefined

        const blogs = await prisma.blog.findMany({
            where: {
                isPublished: true,
                ...(destinationId ? { destinationId: Number(destinationId) } : {}),
                ...(tag ? { tags: { contains: tag, mode: "insensitive" } } : {}),
            },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                coverImage: true,
                author: true,
                tags: true,
                readingMinutes: true,
                publishedAt: true,
                destination: { select: { id: true, name: true, city: true, country: true } },
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            ...(limit ? { take: limit } : {}),
        })

        return NextResponse.json(blogs)
    } catch (error) {
        console.error("Error fetching blogs:", error)
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
    }
}
