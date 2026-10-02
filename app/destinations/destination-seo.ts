/**
 * Per-destination titles and descriptions.
 *
 * Every destination landing page needs its own title, description and canonical
 * URL — previously they all shared the generic "Explore Destinations" metadata
 * and a single /destinations canonical, so Google saw them as one page.
 *
 * Keys are matched case-insensitively against the ?country= / ?region= value.
 */
export interface DestinationSeo {
    title: string
    description: string
}

export const DESTINATION_SEO: Record<string, DestinationSeo> = {
    india: {
        title: "India Tour Packages & Group Trips | Travplan",
        description:
            "Book India tour packages with Travplan. Explore mountain getaways, cultural trips, group departures, custom holidays and enquiry support.",
    },
    indonesia: {
        title: "Indonesia Tour Packages & Bali Trips | Travplan",
        description:
            "Plan an Indonesia holiday with Travplan. Explore Bali trips, island getaways, cultural routes, custom itineraries and package enquiries.",
    },
    thailand: {
        title: "Thailand Tour Packages & Holiday Trips | Travplan",
        description:
            "Book Thailand tour packages with Travplan. Explore Bangkok, Phuket, Krabi, island trips, custom itineraries and enquiry support.",
    },
    bhutan: {
        title: "Bhutan Tour Packages & Holiday Trips | Travplan",
        description:
            "Plan a Bhutan holiday with Travplan. Explore Thimphu, Paro, Himalayan routes, guided itineraries and custom package enquiries.",
    },
    vietnam: {
        title: "Vietnam Tour Packages & Holiday Trips | Travplan",
        description:
            "Book Vietnam tour packages with Travplan. Explore Hanoi, Halong Bay, Da Nang, Ho Chi Minh City, curated routes and enquiry options.",
    },
    dubai: {
        title: "Dubai Tour Packages & Holiday Trips | Travplan",
        description:
            "Plan a Dubai holiday with Travplan. Explore city tours, desert safari trips, family itineraries, inclusions and enquiry support.",
    },
    singapore: {
        title: "Singapore Tour Packages & Family Trips | Travplan",
        description:
            "Book Singapore tour packages with Travplan. Explore family holidays, city attractions, Sentosa experiences and custom itinerary support.",
    },
    japan: {
        title: "Japan Tour Packages & Holiday Trips | Travplan",
        description:
            "Plan a Japan trip with Travplan. Explore Tokyo, Kyoto, Osaka, seasonal routes, group tours and custom holiday enquiries.",
    },
    malaysia: {
        title: "Malaysia Tour Packages & Holiday Trips | Travplan",
        description:
            "Book Malaysia tour packages with Travplan. Explore Kuala Lumpur, Genting, Langkawi, family trips, inclusions and enquiry options.",
    },
    "sri lanka": {
        title: "Sri Lanka Tour Packages & Holiday Trips | Travplan",
        description:
            "Plan a Sri Lanka holiday with Travplan. Explore beaches, wildlife, cultural routes, family trips and custom package enquiries.",
    },
    georgia: {
        title: "Georgia Tour Packages & Holiday Trips | Travplan",
        description:
            "Book Georgia tour packages with Travplan. Explore Tbilisi, mountain routes, culture, stays, inclusions and enquiry options.",
    },
    australia: {
        title: "Australia Tour Packages & Holiday Trips | Travplan",
        description:
            "Plan an Australia holiday with Travplan. Explore city stays, nature routes, family trips, custom itineraries and enquiry support.",
    },
    nepal: {
        title: "Nepal Tour Packages & Himalayan Trips | Travplan",
        description:
            "Book Nepal tour packages with Travplan. Explore Kathmandu, Pokhara, Himalayan routes, group trips and custom holiday enquiries.",
    },
    kashmir: {
        title: "Kashmir Tour Packages & Group Trips | Travplan",
        description:
            "Book Kashmir tour packages with Travplan. Explore Srinagar, Gulmarg, Pahalgam, group departures, inclusions and enquiry options.",
    },
}

/** Looks up curated copy, falling back to a generated title/description. */
export function getDestinationSeo(name: string): DestinationSeo {
    const curated = DESTINATION_SEO[name.trim().toLowerCase()]
    if (curated) return curated

    const label = name.trim()
    return {
        title: `${label} Tour Packages & Holiday Trips | Travplan`,
        description: `Browse ${label} tour packages with Travplan. Compare routes, durations, inclusions, departure options and enquire with our travel team.`,
    }
}
