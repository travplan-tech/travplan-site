/**
 * Seeds the Kashmir 4N/5D trip — Srinagar, Gulmarg, Sonamarg and Pahalgam.
 *
 *   node --env-file=.env.local scripts/seed-pkg-kashmir-4n5d.mjs <price> [originalPrice]
 *
 * Price is passed in rather than stored: the brochure carries none, and the
 * script must not invent a figure customers would pay.
 *
 * Re-runnable: matched on title, so a second run updates rather than duplicates.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const PRICE = Number(process.argv[2])
const ORIGINAL_PRICE = process.argv[3] ? Number(process.argv[3]) : null

if (!Number.isFinite(PRICE) || PRICE <= 0) {
    console.error("usage: node --env-file=.env.local scripts/seed-pkg-kashmir-4n5d.mjs <price> [originalPrice]")
    process.exit(1)
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
}

// Aiven presents a self-signed chain; lib/prisma.ts does the same for dev.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const stock = (name) =>
    `https://res.cloudinary.com/dcolmsvtp/image/upload/TravPlan/stock/${name}.jpg`

const DESTINATION_NAME = "Kashmir, India"

const itinerary = [
    {
        day: 1,
        title: "Arrival in Srinagar | Shikara Ride on Dal Lake",
        description:
            "* Arrive in Srinagar and transfer to your houseboat or hotel.\n" +
            "* In the evening, take a shikara ride on Dal Lake — past the floating gardens, the old wooden homes and the reflections off the water at golden hour.\n" +
            "* Take a leisurely walk near Boulevard Road.\n" +
            "* Dinner and overnight stay in Srinagar.\n\n" +
            "🏨 Overnight Stay: Srinagar\n" +
            "🍽️ Meals Included: Dinner\n\n" +
            "📌 Points to note:\n" +
            "* One shikara ride per booking is included.\n" +
            "* Houseboat stay is as per the plan you select.\n",
    },
    {
        day: 2,
        title: "Srinagar to Gulmarg and back | Meadow of Flowers",
        description:
            "* Breakfast at the hotel.\n" +
            "* Set out for a full-day excursion to Gulmarg.\n" +
            "* Free time to explore the meadows, or the snow if you are travelling in season.\n" +
            "* The Gondola ride and other activities can be added at your own cost.\n" +
            "* Return to Srinagar by evening.\n" +
            "* Dinner at the hotel.\n\n" +
            "🏨 Overnight Stay: Srinagar\n" +
            "🍽️ Meals Included: Breakfast & Dinner\n\n" +
            "📌 Points to note:\n" +
            "* Gondola tickets are not included. The ride depends on the weather and on daily slot availability, and tickets must be booked in advance at jammukashmircablecar.com.\n" +
            "* Confirm the Gulmarg day with our team before booking — the order of the itinerary can change.\n",
    },
    {
        day: 3,
        title: "Srinagar to Sonamarg and back | Thajiwas Glacier",
        description:
            "* Breakfast at the hotel.\n" +
            "* Drive out for a scenic day at Sonamarg, the meadow of gold.\n" +
            "* Visit the Thajiwas Glacier, with an optional pony ride at your own cost.\n" +
            "* Free time for photographs and for doing very little.\n" +
            "* Return to Srinagar by evening.\n" +
            "* Dinner at the hotel.\n\n" +
            "🏨 Overnight Stay: Srinagar\n" +
            "🍽️ Meals Included: Breakfast & Dinner\n\n" +
            "📌 Points to note:\n" +
            "* Zero Point and Thajiwas Glacier can only be reached by local union taxi, hired on the spot and paid directly.\n",
    },
    {
        day: 4,
        title: "Srinagar to Pahalgam | Betaab, Aru and Chandanwari",
        description:
            "* After breakfast, drive to Pahalgam.\n" +
            "* Sightseeing by local union taxi through Betaab Valley, Aru Valley and Chandanwari.\n" +
            "* Check in to the hotel in Pahalgam.\n" +
            "* Dinner at the hotel.\n\n" +
            "🏨 Overnight Stay: Pahalgam\n" +
            "🍽️ Meals Included: Breakfast & Dinner\n\n" +
            "📌 Points to note:\n" +
            "* Local union rules do not allow outside vehicles for sightseeing inside Pahalgam. Union taxis are hired locally at your own cost, and we do not control their availability or pricing.\n" +
            "* Chandanwari may require a pony ride or local transport, also paid locally.\n",
    },
    {
        day: 5,
        title: "Pahalgam to Srinagar | Departure",
        description:
            "* Breakfast at the hotel.\n" +
            "* Drive back to Srinagar.\n" +
            "* Drop at Srinagar Airport for your onward journey.\n\n" +
            "✈️ Drop Point: Srinagar Airport\n" +
            "🍽️ Meals Included: Breakfast\n\n" +
            "📌 Points to note:\n" +
            "* Allow enough time for the drive — Pahalgam to Srinagar airport takes around three hours and is weather-dependent.\n",
    },
]

const pkg = {
    title: "Kashmir 4 Nights, 5 Days | Srinagar, Gulmarg, Sonamarg & Pahalgam",
    description:
        "Four nights across the Kashmir valley — a shikara ride on Dal Lake, a full day in the Gulmarg meadows, the Thajiwas Glacier at Sonamarg, and Betaab, Aru and Chandanwari out of Pahalgam. Private vehicle throughout, breakfast and dinner daily, and a houseboat night on the lake.",
    price: PRICE,
    originalPrice: ORIGINAL_PRICE,
    duration: "4N/5D",
    cities: "Srinagar → Gulmarg → Sonamarg → Pahalgam → Srinagar",
    image: stock("kashmir-dal-houseboats"),
    mapImage: "",
    galleryImages: [
        "kashmir-dal-shikaras",
        "kashmir-dal-reflection",
        "kashmir-snow-range",
        "kashmir-meadow-village",
        "kashmir-meadow-horses",
        "kashmir-valley-river",
        "kashmir-meadow-mountains",
        "kashmir-dal-fruit-seller",
        "kashmir-dal-floating-village",
    ].map(stock).join(","),
    highlights:
        "🛶 Shikara ride on Dal Lake past the floating gardens and the old wooden houseboats.\n" +
        "🏔️ A full day in Gulmarg, with the Gondola and snow activities available on the day.\n" +
        "🧊 Thajiwas Glacier at Sonamarg, the meadow of gold.\n" +
        "🌲 Betaab Valley, Aru Valley and Chandanwari out of Pahalgam.\n" +
        "🏡 A houseboat night on Dal Lake, as per your selected plan.\n" +
        "🚗 A dedicated private vehicle for the whole trip, with a driver who knows the hill routes.\n" +
        "🍽️ Breakfast and dinner every day on the MAP plan.\n" +
        "🕰️ Leisure time built into each day rather than a rushed schedule.",
    specialNotes:
        "🚠 Gulmarg Gondola: Tickets are not included and are not sold by us. The ride depends on weather and daily slot availability, and tickets should be booked in advance at jammukashmircablecar.com. Confirm your Gulmarg day with our team before booking, as the order of the itinerary may change.\n" +
        "🚕 Pahalgam Union Taxis: Local union rules do not permit outside vehicles for sightseeing within Pahalgam. Union taxis for Betaab, Aru and Chandanwari are hired locally at your own cost. We do not control their availability or pricing.\n" +
        "🚕 Sonamarg Zero Point: Thajiwas Glacier and Zero Point are reachable only by local union taxi, hired on the spot and paid directly.\n" +
        "❄️ Snow Jeeps: In heavy snow, chain-fitted vehicles or snow jeeps may be compulsory on some stretches. Any such charge is paid directly by the traveller and availability depends on local authorities.\n" +
        "🌦️ Weather: Kashmir is weather-sensitive. Sightseeing may be delayed, changed or cancelled by snowfall, landslides or government advisories, and no refund is given for sightseeing missed that way. Where a road closes, alternative sightseeing is arranged where possible; any extra vehicle, taxi or buffer stay needed is borne by the traveller.\n" +
        "⏰ Timings: Departure times are fixed and must be kept. Please stay reachable on the number you register — we are not responsible for delays caused by late reporting or network problems.\n" +
        "🚭 In the Vehicle: Smoking, alcohol and any substance use inside the vehicle are not permitted.\n" +
        "💳 Booking: Reserve with 30% of the tour cost as advance; flights, if included, are paid in full up front. The balance is due on Day 1. EMI options are available — ask the sales team.\n" +
        "🛏️ Damages: The person making the booking is responsible for damage to hotel rooms, houseboats, camps or resort property, payable directly to the provider.\n" +
        "🗺️ Itinerary: Only the sightseeing listed in the confirmed itinerary is covered. Anything additional is arranged independently at your own cost, and sightseeing missed through late arrival or personal delay is not compensated.\n" +
        "🩺 Health: Please make sure you are medically fit to travel, particularly in cold weather. Travel insurance is strongly recommended and is not included.\n" +
        "🧳 Belongings: Please look after your valuables — we cannot be responsible for loss, theft or damage to personal belongings, and heavy or unnecessary luggage is best left behind.",
    tourType: "Family, Couples",
    tourCategory: "PRIVATE",
    maxPersons: 10,
    accommodation: "Hotels & Houseboat",
    discountPercent: 0,
    tags:
        "#Kashmir #Srinagar #Gulmarg #Sonamarg #Pahalgam #DalLake #Shikara #Houseboat #ThajiwasGlacier " +
        "#BetaabValley #AruValley #Chandanwari #KashmirTour #ParadiseOnEarth #IncredibleIndia #PrivateTour " +
        "#MountainEscape #Travplan",
    isCustomizable: true,
    bestPrice: true,
    flightsIncluded: false,
    departureDates: "[]",
    departureType: "Flexible",
    departurePoints: "Srinagar",
    itinerary: JSON.stringify(itinerary),
    inclusions:
        "* Accommodation for 4 nights in comfortable hotels in Srinagar and Pahalgam.\n" +
        "* Houseboat stay on Dal Lake, as per the selected plan.\n" +
        "* Daily breakfast and dinner on the MAP plan.\n" +
        "* A dedicated private vehicle for the entire trip, with an experienced local driver.\n" +
        "* Srinagar → Gulmarg → Srinagar.\n" +
        "* Srinagar → Sonamarg → Srinagar.\n" +
        "* Srinagar → Pahalgam → Srinagar.\n" +
        "* Shikara ride on Dal Lake, one ride per booking.\n" +
        "* Scenic sightseeing as per the itinerary, with leisure time built into each day.\n" +
        "* All applicable hotel taxes, transport taxes and service charges.\n",
    exclusions:
        "* Flights and train tickets to and from Srinagar.\n" +
        "* Gondola Ride Phase-2 at Apharwat Peak.\n" +
        "* Pony rides at Sonamarg and Pahalgam.\n" +
        "* Snow activities, ATV rides, skiing and similar.\n" +
        "* Local union cabs for Aru Valley, Betaab Valley and Chandanwari, as required by local rules.\n" +
        "* Personal expenses such as tips, laundry, shopping, phone calls and room service.\n" +
        "* Any meals not listed under Inclusions.\n" +
        "* Expenses arising from weather, road closures or natural disturbances.\n" +
        "* Any increase in taxes or fuel prices after booking.\n" +
        "* Anything not specifically mentioned under Inclusions.\n",
    cancellationPolicy:
        "* 30 days or more before departure: Full refund after deducting a 10% administrative charge.\n" +
        "* 15–29 days before departure: 50% of the total trip cost is charged.\n" +
        "* 7–14 days before departure: 75% of the total trip cost is charged.\n" +
        "* Less than 7 days before departure or no-show: 100% of the total trip cost is charged. No refund is given.\n" +
        "* No refunds are given for unused services, early departures or missed activities.\n",
    priceChartImage: "",
}

// --------------------------------------------------------------------- seed

const destination = await prisma.destination.findFirst({ where: { name: DESTINATION_NAME } })
if (!destination) {
    console.error(`destination "${DESTINATION_NAME}" not found`)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
}

const existing = await prisma.package.findFirst({ where: { title: pkg.title } })

const saved = existing
    ? await prisma.package.update({ where: { id: existing.id }, data: { ...pkg, destinationId: destination.id } })
    : await prisma.package.create({ data: { ...pkg, destinationId: destination.id } })

console.log(`${existing ? "updated" : "created"} package ${saved.id} — ${saved.title}`)

const tours = await prisma.package.count({ where: { destinationId: destination.id } })
await prisma.destination.update({ where: { id: destination.id }, data: { tours } })
console.log(`destination ${destination.id} now lists ${tours} tour${tours === 1 ? "" : "s"}`)

console.log(`\nlive at /destinations/trip/${saved.id} once the page revalidates`)

await prisma.$disconnect()
await pool.end()
