/**
 * Editorial content for destination landing pages.
 *
 * Everything here is written once and rendered server-side, so a destination
 * page has real content in its HTML rather than an empty shell the browser
 * fills in. Trip counts, prices and durations are NOT stored here — those come
 * from live inventory at render time, so the page cannot advertise a figure the
 * database disagrees with.
 *
 * Deliberately avoided: visa rules, entry fees and anything else that changes
 * without notice. A page that states a stale visa rule is worse than one that
 * tells the reader to check.
 */

export interface ThingToDo {
    title: string
    blurb: string
}

export interface DestinationFaq {
    q: string
    a: string
}

export interface DestinationGuide {
    /** One or two sentences under the H1. Sets the frame for the page. */
    intro: string[]
    /** "Best time to visit" — peak season first, then the shoulder/off season. */
    bestTime: string[]
    thingsToDo: ThingToDo[]
    /** "How many days do you need?" — one or two sentences. */
    daysNeeded: string
    faqs: DestinationFaq[]
}

import { INDIA_HIMALAYA } from "./destination-guides/india-himalaya"
import { INDIA_NORTH } from "./destination-guides/india-north"
import { INDIA_SOUTH_EAST } from "./destination-guides/india-south-east"
import { INTERNATIONAL } from "./destination-guides/international"

export const DESTINATION_GUIDES: Record<string, DestinationGuide> = {
    ...INDIA_HIMALAYA,
    ...INDIA_NORTH,
    ...INDIA_SOUTH_EAST,
    ...INTERNATIONAL,
}

/**
 * Returns the written guide for a slug, or null.
 *
 * Null rather than a generated stand-in on purpose: a page with no guide
 * renders its trips and skips the editorial sections, which is honest. Padding
 * it with auto-generated filler would be the thin content this work exists to
 * remove.
 */
export function getDestinationGuide(slug: string): DestinationGuide | null {
    return DESTINATION_GUIDES[slug.toLowerCase()] ?? null
}
