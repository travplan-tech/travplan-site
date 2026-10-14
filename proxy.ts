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

    return NextResponse.next()
}

export const config = {
    // Skip anything that is not a page: a redirect on assets or API routes
    // costs a round trip and buys nothing.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)"],
}
