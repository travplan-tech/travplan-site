/**
 * Slugs for destination landing pages.
 *
 * Destination names carry their country ("Kerala, India", "Spiti Valley,
 * India"), which is useful in a heading but not in a URL, so the country is
 * dropped and the rest slugified: "Kerala, India" -> "kerala".
 *
 * Slugs are derived rather than stored so a renamed destination cannot drift
 * out of sync with its URL. The trade-off is that renaming a destination
 * changes its URL; that is why resolveDestinationSlug also matches on city, so
 * a near-miss still finds the row instead of 404ing.
 */

export function destinationSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/,.*$/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

/** Picks the destination whose name — or failing that, city — matches a slug. */
export function matchBySlug<T extends { name: string; city?: string | null }>(
    rows: T[],
    slug: string
): T | undefined {
    const wanted = slug.toLowerCase()
    return (
        rows.find((d) => destinationSlug(d.name) === wanted) ??
        rows.find((d) => d.city && destinationSlug(d.city) === wanted)
    )
}
