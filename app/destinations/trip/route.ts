import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { DESTINATION_SLUG_BY_ID } from "@/lib/destination-map.generated"

/**
 * The old destination landing URL: /destinations/trip?destination=<id>.
 *
 * It rendered entirely in the browser, so crawlers saw an empty shell. That
 * content now lives at /destinations/<slug>, server-rendered.
 *
 * This is a route handler rather than a page that calls redirect(), because
 * app/destinations/loading.tsx puts a Suspense boundary above this segment:
 * the response starts streaming before an awaited redirect is thrown, and Next
 * then downgrades it to a soft client-side redirect with a 200.
 *
 * The id -> slug table is generated at build time (scripts/generate-destination-map.mjs)
 * so the common path never opens a database connection — that cost 2.3s on a
 * cold invocation for a response that is only a Location header. An id the
 * table does not cover falls back to a lookup, which is the case for a
 * destination added since the last deploy.
 *
 * 308 rather than 307: the move is permanent, so the old URL gives up its
 * ranking signals to the new one.
 */
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const base = new URL("/destinations", request.url)
    const id = Number(request.nextUrl.searchParams.get("destination"))

    if (!Number.isFinite(id) || id <= 0) {
        return NextResponse.redirect(base, 308)
    }

    const known = DESTINATION_SLUG_BY_ID[id]
    if (known) {
        return NextResponse.redirect(new URL(`/destinations/${known}`, request.url), 308)
    }

    // Not in the build-time table: either a new destination or a bad id. Only
    // this path pays for the database.
    try {
        const { getAllDestinations } = await import("@/lib/destination-page-data")
        const match = (await getAllDestinations()).find((d) => d.id === id)
        return NextResponse.redirect(
            match ? new URL(`/destinations/${match.slug}`, request.url) : base,
            308
        )
    } catch (error) {
        // A database blip must not turn an old bookmark into a 500. 307 keeps
        // the fallback temporary so the permanent target still wins later.
        console.error("destination redirect lookup failed:", error)
        return NextResponse.redirect(base, 307)
    }
}
