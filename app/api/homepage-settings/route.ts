import { NextResponse } from "next/server"
import { getHomepageSettings, PAGE_REVALIDATE } from "@/lib/home-data"

// GET - Fetch homepage settings (public endpoint)
export async function GET() {
    const settings = await getHomepageSettings()
    if (!settings) {
        return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } })
    }
    return NextResponse.json(settings, {
        headers: {
            "Cache-Control": `public, s-maxage=${PAGE_REVALIDATE}, stale-while-revalidate=3600`,
        },
    })
}
