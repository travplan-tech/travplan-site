import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAllDestinations } from "@/lib/destination-page-data"

/**
 * The old destination landing URL: /destinations/trip?destination=<id>.
 *
 * It rendered entirely in the browser, so crawlers saw an empty shell — no
 * destination name, no trips, no copy. That content now lives at
 * /destinations/<slug>, server-rendered.
 *
 * This is a route handler rather than a page that calls redirect(), because
 * app/destinations/loading.tsx puts a Suspense boundary above this segment:
 * the response starts streaming before an awaited redirect is thrown, and Next
 * then has to downgrade it to a soft client-side redirect with a 200. Search
 * engines need the real status code, so no rendering happens here at all.
 *
 * 308 rather than 307: the move is permanent, so the old URL should give up
 * its ranking signals to the new one.
 */
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const base = new URL("/destinations", request.url)
    const id = Number(request.nextUrl.searchParams.get("destination"))

    if (!Number.isFinite(id) || id <= 0) {
        return NextResponse.redirect(base, 308)
    }

    try {
        const match = (await getAllDestinations()).find((d) => d.id === id)
        return NextResponse.redirect(
            match ? new URL(`/destinations/${match.slug}`, request.url) : base,
            308
        )
    } catch (error) {
        // A database blip must not turn an old bookmark into a 500. Falling
        // back to the index keeps the link working, and 307 keeps the mistake
        // temporary so the permanent target is still honoured once resolvable.
        console.error("destination redirect lookup failed:", error)
        return NextResponse.redirect(base, 307)
    }
}
