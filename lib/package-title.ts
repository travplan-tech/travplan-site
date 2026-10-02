/** Titles that already say what the product is, so "Tour Package" is redundant. */
const DESCRIBES_PRODUCT =
    /\b(tour|package|trip|expedition|adventure|ride|yatra|escape|odyssey|safari|getaway|holiday|circuit|trek)\b/i

/**
 * Package titles are stored in a compact admin format such as "Kashmir-4N/5D".
 * That reads badly as a search result, so expand it into a natural title.
 * Titles that are already descriptive ("Ladakh Bike Expedition") are left alone.
 */
export function readableTitle(raw: string, duration?: string | null): string {
    // Strip leading emoji/symbols that some titles carry for the admin UI.
    const title = raw.replace(/^[^\p{L}\p{N}]+/u, "").trim()

    // "Kashmir-4N/5D" or "Kerala 7N/8D" -> "Kashmir Tour Package 4N/5D"
    const compact = title.match(/^(.+?)[\s|-]*(\d+\s*N\s*\/\s*\d+\s*D)$/i)
    if (compact) {
        const place = compact[1].replace(/[-|\s]+$/, "").trim()
        const nights = compact[2].replace(/\s+/g, "").toUpperCase()
        // Only name the product when the title does not already describe it,
        // so "Ladakh Bike Expedition | 7N/8D" does not become
        // "Ladakh Bike Expedition Tour Package 7N/8D".
        return DESCRIBES_PRODUCT.test(place)
            ? `${place} ${nights}`
            : `${place} Tour Package ${nights}`
    }

    // Already descriptive: add the duration only when it is not already stated.
    if (duration && !/\d+\s*N/i.test(title)) {
        return `${title} ${duration.replace(/\s+/g, "")}`
    }
    return title
}

/** Turns "4N/5D" into "4 nights, 5 days" for description copy. */
export function spelledDuration(duration?: string | null): string | null {
    if (!duration) return null
    const m = duration.match(/(\d+)\s*N\s*\/\s*(\d+)\s*D/i)
    if (!m) return null
    return `${m[1]} nights, ${m[2]} days`
}

/**
 * Full <title> for a package page. Prefers the longer, more descriptive brand
 * suffix while it still fits inside Google's display width.
 */
export function packagePageTitle(raw: string, duration?: string | null): string {
    const nice = readableTitle(raw, duration)
    const preferred = `${nice} | Book with Travplan`
    return preferred.length <= 60 ? preferred : `${nice} | Travplan`
}

/** Meta description for a package page, falling back to generated copy. */
export function packagePageDescription(
    raw: string,
    duration: string | null | undefined,
    place: string | null | undefined,
    storedDescription?: string | null
): string {
    // Long editorial copy gets truncated in results, so prefer the concise line.
    if (storedDescription && storedDescription.length <= 160) return storedDescription

    const spelled = spelledDuration(duration)
    const where = place?.trim() ? ` ${place.trim()}` : ""
    return spelled
        ? `Book a ${spelled}${where} tour package with Travplan. Check itinerary highlights, stays, inclusions and enquiry options.`
        : `Book ${readableTitle(raw, duration)} with Travplan. Check itinerary highlights, stays, inclusions and enquiry options.`
}
