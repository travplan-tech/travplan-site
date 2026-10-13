import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { requireAdmin } from "@/lib/auth-helpers"
import { appFolderExpression, isAppFolder } from "@/lib/media-folders"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function adminOnly() {
    const { user, error, status } = await requireAdmin()
        if (error || !user) {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }
    return null
}

/**
 * Browse the Cloudinary library.
 *
 * Query params:
 *   folder     restrict to one folder, e.g. "TravPlan/experts"; omitted or
 *              "all" searches every app folder
 *   q          search text matched against the public id
 *   type       "image" (default) or "video"
 *   cursor     next_cursor from a previous page
 */
export async function GET(request: Request) {
    const denied = await adminOnly()
    if (denied) return denied

    try {
        const { searchParams } = new URL(request.url)
        const folder = searchParams.get("folder")
        const q = searchParams.get("q")?.trim()
        const type = searchParams.get("type") === "video" ? "video" : "image"
        const cursor = searchParams.get("cursor") || undefined

        // Never search outside the folders the app owns, whatever is passed in.
        const scope =
            folder && folder !== "all" && isAppFolder(folder)
                ? `folder:${folder}/*`
                : appFolderExpression()

        const parts = [`resource_type:${type}`, `(${scope})`]
        if (q) parts.push(`public_id:*${q.replace(/[^\w\s/-]/g, "")}*`)

        let search = cloudinary.search
            .expression(parts.join(" AND "))
            .sort_by("created_at", "desc")
            .max_results(30)
        if (cursor) search = search.next_cursor(cursor)

        const result = await search.execute()

        return NextResponse.json({
            resources: (result.resources || []).map(
                (r: {
                    public_id: string
                    secure_url: string
                    format: string
                    width: number
                    height: number
                    bytes: number
                    created_at: string
                    resource_type: string
                }) => ({
                    publicId: r.public_id,
                    url: r.secure_url,
                    format: r.format,
                    width: r.width,
                    height: r.height,
                    bytes: r.bytes,
                    createdAt: r.created_at,
                    resourceType: r.resource_type,
                })
            ),
            nextCursor: result.next_cursor || null,
            total: result.total_count ?? null,
        })
    } catch (error) {
        console.error("Error listing media:", error)
        return NextResponse.json({ error: "Failed to list media" }, { status: 500 })
    }
}

/** Delete one asset by public id. */
export async function DELETE(request: Request) {
    const denied = await adminOnly()
    if (denied) return denied

    try {
        const { searchParams } = new URL(request.url)
        const publicId = searchParams.get("publicId")
        const type = searchParams.get("type") === "video" ? "video" : "image"

        if (!publicId) {
            return NextResponse.json({ error: "publicId is required" }, { status: 400 })
        }
        if (!isAppFolder(publicId)) {
            return NextResponse.json(
                { error: "Only assets inside the app's own folders can be deleted" },
                { status: 400 }
            )
        }

        const result = await cloudinary.uploader.destroy(publicId, { resource_type: type })
        if (result.result !== "ok" && result.result !== "not found") {
            return NextResponse.json({ error: result.result }, { status: 400 })
        }

        return NextResponse.json({ success: true, result: result.result })
    } catch (error) {
        console.error("Error deleting media:", error)
        return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
    }
}
