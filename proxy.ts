import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Sends the apex domain to www with a permanent redirect.
 *
 * Vercel's own domain redirect answers travplan.in with a 307 (temporary) and
 * its dashboard offers no way to make that permanent, so search engines are
 * told the move might be reversed and consolidate signals less readily. This
 * issues a 308 instead.
 *
 * It only takes effect once travplan.in is attached to the project as a normal
 * domain rather than a "Redirect to" domain — while the platform redirect is
 * in place it answers first and this never runs.
 */
const CANONICAL_HOST = "www.travplan.in"
const APEX_HOST = "travplan.in"

/**
 * Listings whose output depends only on the URL.
 *
 * Both read searchParams, which makes them dynamic, and Next then sends
 * no-store: every visitor paid a server invocation for markup that is the
 * same for everyone and only changes when inventory does. Setting the header
 * in next.config does not survive — Vercel replaces it on a dynamic page
 * response — but a header set here does, because it is applied at the edge
 * after the function returns.
 */
const CACHEABLE_LISTINGS = new Set(["/destinations", "/tours"])
const LISTING_CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=86400"

export default function proxy(request: NextRequest) {
    const host = request.headers.get("host")?.toLowerCase()

    if (host === APEX_HOST) {
        const url = request.nextUrl.clone()
        url.host = CANONICAL_HOST
        url.protocol = "https:"
        url.port = ""
        // 308 keeps the method and body, and is the permanent counterpart to
        // the 307 Vercel issues today.
        return NextResponse.redirect(url, 308)
    }

    const response = NextResponse.next()

    // Logged-in visitors see the same listing markup — the account-specific
    // parts (favourites) are fetched in the browser — so a shared cache entry
    // cannot leak anything between them.
    if (CACHEABLE_LISTINGS.has(request.nextUrl.pathname)) {
        response.headers.set("Cache-Control", LISTING_CACHE_CONTROL)
    }

    return response
}

export const config = {
    // Skip anything that is not a page: a redirect on assets or API routes
    // costs a round trip and buys nothing.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)"],
}
