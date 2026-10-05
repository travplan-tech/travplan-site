import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const blog = await prisma.blog.findFirst({
            where: { slug, isPublished: true },
            include: {
                destination: { select: { id: true, name: true, city: true, country: true } },
            },
        })

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 })
        }

        return NextResponse.json(blog)
    } catch (error) {
        console.error("Error fetching blog:", error)
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
    }
}
