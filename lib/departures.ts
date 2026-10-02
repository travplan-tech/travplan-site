/**
 * Departure dates are stored as a plain list, so past dates were being shown
 * as "upcoming" indefinitely. Everything surfaced to travellers (and to search
 * engines, which read these as availability) must go through this filter.
 */
export function upcomingDeparturesOnly<T extends { date: string }>(departures: T[]): T[] {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    return departures
        .filter((departure) => {
            const parsed = new Date(departure.date)
            if (Number.isNaN(parsed.getTime())) return false
            return parsed.getTime() >= startOfToday.getTime()
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
