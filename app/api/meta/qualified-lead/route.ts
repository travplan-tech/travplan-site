import { NextResponse } from "next/server"

const META_DATASET_ID = process.env.META_DATASET_ID
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
const META_WABA_ID = process.env.META_WABA_ID
const META_API_VERSION = process.env.META_API_VERSION || "v26.0"

// Converts any incoming event_time (ISO string, date string, ms or seconds) to unix seconds
function toUnixSeconds(value: unknown): number | null {
    if (value === undefined || value === null || value === "") return null

    const numeric = typeof value === "number" ? value : Number(value)
    if (!Number.isNaN(numeric)) {
        // Anything this large is milliseconds
        return numeric > 1e11 ? Math.floor(numeric / 1000) : Math.floor(numeric)
    }

    const parsed = Date.parse(String(value))
    if (Number.isNaN(parsed)) return null
    return Math.floor(parsed / 1000)
}

export async function POST(request: Request) {
    try {
        if (!META_DATASET_ID || !META_ACCESS_TOKEN) {
            console.error("Meta Conversions API is not configured")
            return NextResponse.json(
                { error: "Meta Conversions API is not configured" },
                { status: 500 }
            )
        }

        const body = await request.json()

        const ctwaClid = body.ctwa_clid
        if (!ctwaClid) {
            return NextResponse.json(
                { error: "ctwa_clid is required" },
                { status: 400 }
            )
        }

        // Fall back to now if event_time is missing
        const eventTime =
            body.event_time === undefined || body.event_time === null || body.event_time === ""
                ? Math.floor(Date.now() / 1000)
                : toUnixSeconds(body.event_time)

        if (eventTime === null) {
            return NextResponse.json(
                { error: "event_time is not a valid date" },
                { status: 400 }
            )
        }

        const userData: Record<string, string> = {
            whatsapp_business_account_id: META_WABA_ID || META_DATASET_ID,
            ctwa_clid: String(ctwaClid),
        }

        const payload = {
            data: [
                {
                    event_name: body.event_name || "QualifiedLead",
                    event_time: eventTime,
                    action_source: "business_messaging",
                    messaging_channel: "whatsapp",
                    user_data: userData,
                    ...(body.custom_data ? { custom_data: body.custom_data } : {}),
                },
            ],
        }

        const metaResponse = await fetch(
            `https://graph.facebook.com/${META_API_VERSION}/${META_DATASET_ID}/dataset?access_token=${META_ACCESS_TOKEN}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        )

        const metaResult = await metaResponse.json()

        if (!metaResponse.ok) {
            console.error("Meta Conversions API error:", metaResult)
            return NextResponse.json(
                { error: "Meta Conversions API rejected the event", details: metaResult },
                { status: 502 }
            )
        }

        return NextResponse.json({
            success: true,
            event_time: eventTime,
            meta: metaResult,
        })
    } catch (error) {
        console.error("Error sending qualified lead to Meta:", error)
        return NextResponse.json(
            { error: "Failed to send qualified lead to Meta" },
            { status: 500 }
        )
    }
}
