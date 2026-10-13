import { NextResponse } from "next/server"
import { getFeatureBoxes, PAGE_REVALIDATE } from "@/lib/home-data"

// GET - Public API to fetch active feature boxes
export async function GET() {
    const featureBoxes = await getFeatureBoxes()
    if (!featureBoxes) {
        // The component falls back to its own defaults on an empty list.
        return NextResponse.json([], { headers: { "Cache-Control": "no-store" } })
    }
    return NextResponse.json(featureBoxes, {
        headers: {
            "Cache-Control": `public, s-maxage=${PAGE_REVALIDATE}, stale-while-revalidate=3600`,
        },
    })
}
