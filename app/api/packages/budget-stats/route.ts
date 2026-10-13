import { NextResponse } from "next/server"
import { getBudgetStats, PAGE_REVALIDATE } from "@/lib/home-data"

const EMPTY = {
    domestic: { totalTours: 0, budgetCounts: {} },
    international: { totalTours: 0, budgetCounts: {} },
}

/**
 * Package counts per budget band. Served from the same cached loader the
 * statically rendered homepage uses, so repeat calls do not re-query.
 */
export async function GET() {
    const result = await getBudgetStats()
    if (!result) {
        // The read failed. Answer with a usable shape, but do not let a CDN
        // cache the failure.
        return NextResponse.json(EMPTY, { headers: { "Cache-Control": "no-store" } })
    }
    return NextResponse.json(result, {
        headers: {
            "Cache-Control": `public, s-maxage=${PAGE_REVALIDATE}, stale-while-revalidate=3600`,
        },
    })
}
