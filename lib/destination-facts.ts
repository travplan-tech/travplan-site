/**
 * Planning facts for a destination, derived from live inventory.
 *
 * The destination pages carried one generic sentence ("Browse our curated
 * collection of trips across X"), which told a visitor — and a search engine —
 * nothing a competitor's page did not also say. Everything here is computed
 * from the packages actually on sale: price range, trip lengths, the cities
 * the routes cover and how departures run. Nothing is invented, so the copy
 * cannot drift from what the company really offers.
 */
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withDbRetry } from "@/lib/db-retry"
import { PAGE_REVALIDATE } from "@/lib/home-data"

export interface DestinationFacts {
    place: string
    tripCount: number
    minPrice: number | null
    maxPrice: number | null
    minNights: number | null
    maxNights: number | null
    /** A couple of representative routes, as written on the packages. */
    routes: string[]
    hasGroupDepartures: boolean
    hasPrivateTrips: boolean
    /** Two or three sentences of planning copy, built from the numbers above. */
    intro: string
}

/** "7 Nights" style figure from a duration string like "7N/8D" or "7 Days". */
function nightsOf(duration: string | null): number | null {
    if (!duration) return null
    const nights = duration.match(/(\d+)\s*N/i)
    if (nights) return Number(nights[1])
    const days = duration.match(/(\d+)/)
    return days ? Math.max(0, Number(days[1]) - 1) : null
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`

/**
 * Package.cities holds a human-written route, but inconsistently: some use
 * arrows ("Leh → Nubra → Pangong"), some commas, some hyphens
 * ("Guwahati-Shillong"). Hyphens cannot be split safely — "Ho Chi-Minh"
 * becomes "Ho Chi → Minh" — so only arrow- and comma-separated routes are
 * used, and the rest are left out rather than mangled.
 */
function routeStops(raw: string): string[] {
    if (!raw || !/[→>,]/.test(raw)) return []
    return raw
        .split(/\s*[→>,]\s*/)
        .map((s) => s.replace(/\s+/g, " ").trim())
        .filter(Boolean)
}

/** A route short enough to read in a sentence. */
function shortRoute(stops: string[]): string | null {
    if (stops.length < 2) return null
    if (stops.length <= 5) return stops.join(" → ")
    // Long circuits: first three stops, then where it ends.
    return `${stops.slice(0, 3).join(" → ")} → … → ${stops[stops.length - 1]}`
}

function buildIntro(f: Omit<DestinationFacts, "intro">): string {
    if (f.tripCount === 0) {
        return `We are not running scheduled trips to ${f.place} at the moment. Tell us your dates and we will put an itinerary together with our local operators.`
    }

    const parts: string[] = []

    const nights =
        f.minNights && f.maxNights
            ? f.minNights === f.maxNights
                ? `${f.minNights} nights`
                : `${f.minNights} to ${f.maxNights} nights`
            : null

    const price =
        f.minPrice !== null
            ? f.minPrice === f.maxPrice
                ? `${inr(f.minPrice)} per person`
                : `${inr(f.minPrice)} to ${inr(f.maxPrice as number)} per person`
            : null

    parts.push(
        `We run ${f.tripCount} ${f.tripCount === 1 ? "trip" : "trips"} to ${f.place}` +
        (nights ? `, ${nights} long` : "") +
        (price ? `, from ${price}.` : ".")
    )

    if (f.routes.length) {
        parts.push(
            f.routes.length === 1
                ? `A typical route runs ${f.routes[0]}.`
                : `Typical routes run ${f.routes[0]}, or ${f.routes[1]}.`
        )
    }

    if (f.hasGroupDepartures && f.hasPrivateTrips) {
        parts.push(
            "Both fixed group departures and private trips on your own dates are available, and every itinerary can be adjusted."
        )
    } else if (f.hasGroupDepartures) {
        parts.push("These run as fixed group departures, and the itinerary can be adjusted.")
    } else if (f.hasPrivateTrips) {
        parts.push("These run as private trips on dates that suit you.")
    }

    return parts.join(" ")
}

const loadFacts = unstable_cache(
    async (where: { country?: string; region?: string }, place: string): Promise<DestinationFacts> => {
        const packages = await prisma.package.findMany({
            where: { destination: { is: where } },
            select: { price: true, duration: true, cities: true, departureType: true },
        })

        const prices = packages.map((p) => p.price).filter((n) => typeof n === "number" && n > 0)
        const nights = packages
            .map((p) => nightsOf(p.duration))
            .filter((n): n is number => n !== null && n > 0)

        // A sample of where the trips actually go, shortest first so the
        // sentence stays readable.
        const routes = [...new Set(
            packages
                .map((p) => shortRoute(routeStops(p.cities || "")))
                .filter((r): r is string => Boolean(r))
        )]
            .sort((a, b) => a.length - b.length)
            .slice(0, 2)

        const types = new Set(packages.map((p) => (p.departureType || "").toUpperCase()))

        const base = {
            place,
            tripCount: packages.length,
            minPrice: prices.length ? Math.min(...prices) : null,
            maxPrice: prices.length ? Math.max(...prices) : null,
            minNights: nights.length ? Math.min(...nights) : null,
            maxNights: nights.length ? Math.max(...nights) : null,
            routes,
            hasGroupDepartures: types.has("GROUP") || types.has("FIXED"),
            hasPrivateTrips: types.has("PRIVATE") || types.has("CUSTOM"),
        }

        return { ...base, intro: buildIntro(base) }
    },
    ["destination-facts"],
    { revalidate: PAGE_REVALIDATE, tags: ["packages"] }
)

/** Returns null when the read fails, so the page falls back to its own copy. */
export async function getDestinationFacts(
    where: { country?: string; region?: string },
    place: string
): Promise<DestinationFacts | null> {
    try {
        return await withDbRetry(() => loadFacts(where, place), { label: "getDestinationFacts" })
    } catch (error) {
        console.error("getDestinationFacts failed:", error)
        return null
    }
}
