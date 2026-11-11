import { NextResponse } from "next/server"
import { revalidateTags, type CacheTag } from "@/lib/revalidate"

export const dynamic = "force-dynamic"

const KNOWN_TAGS: CacheTag[] = [
    "active-sale",
    "blogs",
    "destinations",
    "experts",
    "feature-boxes",
    "homepage-settings",
    "packages",
    "reviews",
]

/**
 * Drops cache tags on demand.
 *
 * Content edited through the admin panel revalidates itself from the write
 * route that changed it. Content seeded by a script has no such route, so
 * until this existed a seeded blog post sat behind a day-old cached index
 * until the window expired or something else triggered a deploy.
 *
 *   curl -X POST https://www.travplan.in/api/revalidate \
 *     -H "authorization: Bearer $REVALIDATE_SECRET" \
 *     -H "content-type: application/json" \
 *     -d '{"tags":["blogs"]}'
 *
 * Fails closed: with REVALIDATE_SECRET unset the route refuses everything,
 * so a missing variable cannot leave cache-busting open to the internet.
 */
export async function POST(request: Request) {
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
        console.error("REVALIDATE_SECRET is not set; refusing to revalidate")
        return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let tags: unknown
    try {
        tags = (await request.json())?.tags
    } catch {
        return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 })
    }

    if (!Array.isArray(tags) || tags.length === 0) {
        return NextResponse.json({ error: "Expected tags: string[]" }, { status: 400 })
    }

    // Only known tags, so a typo fails loudly here rather than silently
    // revalidating nothing and leaving the page stale.
    const unknown = tags.filter((t) => !KNOWN_TAGS.includes(t as CacheTag))
    if (unknown.length > 0) {
        return NextResponse.json(
            { error: `Unknown tags: ${unknown.join(", ")}`, known: KNOWN_TAGS },
            { status: 400 }
        )
    }

    revalidateTags(...(tags as CacheTag[]))
    return NextResponse.json({ revalidated: tags })
}
