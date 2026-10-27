/**
 * Seeds the Manali · Solang · Kasol · Chalal · Manikaran group trip from Delhi.
 *
 *   node --env-file=.env.local scripts/seed-pkg-manali-kasol-group.mjs <price> [originalPrice]
 *
 * Price is passed in rather than stored, because the brochure does not carry
 * one and the script must not invent a figure customers would pay.
 *
 * Re-runnable: matched on title, so a second run updates rather than duplicates.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const PRICE = Number(process.argv[2])
const ORIGINAL_PRICE = process.argv[3] ? Number(process.argv[3]) : null

if (!Number.isFinite(PRICE) || PRICE <= 0) {
    console.error("usage: node --env-file=.env.local scripts/seed-pkg-manali-kasol-group.mjs <price> [originalPrice]")
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

const DESTINATION_NAME = "Manali-Kasol, India"

const itinerary = [
    {
        day: 1,
        title: "Delhi / Chandigarh to Manali | Overnight Journey",
        description:
            "* Meet at Majnu Ka Tilla bus stand, near Vidhan Sabha metro in Delhi, between 7:00 and 7:30 PM.\n" +
            "* Board the vehicle and set off for Manali.\n" +
            "* The coach stops en route for dinner, which is at your own expense.\n" +
            "* Overnight journey, roughly 11 to 12 hours.\n\n" +
            "🚌 Overnight: On the coach\n" +
            "🍽️ Meals Included: None\n" +
            "⏱️ Journey: 10–12 hrs\n\n" +
            "📌 Points to note:\n" +
            "* Reach the boarding point by 7:00 PM — the coach does not wait.\n" +
            "* Carry a light jacket for the journey; the coach gets cold overnight.\n",
    },
    {
        day: 2,
        title: "Manali Local Sightseeing | Hadimba, Vashisht & Mall Road",
        description:
            "* Arrive in Manali, freshen up and have breakfast.\n" +
            "* Head out around midday for a half-day city tour.\n" +
            "* Visit the Hadimba Devi Temple, a cedar-wood shrine in the forest.\n" +
            "* Stop at the Clubhouse, the spot made famous by Yeh Jawaani Hai Deewani.\n" +
            "* Visit the Tibetan monasteries in town.\n" +
            "* Time permitting, continue to Vashisht village, its temple and the hot water spring.\n" +
            "* Spend the evening shopping and walking along Mall Road.\n" +
            "* Return to the hotel around 7 PM for a buffet dinner.\n\n" +
            "🏨 Overnight Stay: Manali\n" +
            "🍽️ Meals Included: Breakfast & Dinner\n\n" +
            "📌 Points to note:\n" +
            "* The sightseeing order may shift with arrival time and local conditions.\n",
    },
    {
        day: 3,
        title: "Solang Valley & Atal Tunnel | Adventure Day",
        description:
            "* Breakfast at the hotel in Manali.\n" +
            "* Travel to Solang Valley for adventure activities — paragliding, zorbing, and skiing, snow scooter or ATV rides depending on the season.\n" +
            "* Continue to the Atal Tunnel and Sissu if the road is open.\n" +
            "* Stop at Old Manali's café street for coffee, photographs and live music.\n" +
            "* Return to the hotel for a DJ night and group games.\n" +
            "* Dinner and overnight stay.\n\n" +
            "🏨 Overnight Stay: Manali\n" +
            "🍽️ Meals Included: Breakfast & Dinner\n\n" +
            "📌 Points to note:\n" +
            "* Adventure activities at Solang are paid separately and are not part of the package.\n" +
            "* Snow activities and the Atal Tunnel road depend on the season and the weather.\n",
    },
    {
        day: 4,
        title: "Manali to Kasol | Riverside Camping",
        description:
            "* Breakfast, then check out from the hotel in Manali.\n" +
            "* Stop at the Beas river en route, where river rafting can be added at your own cost.\n" +
            "* Arrive in Kasol and check in to the riverside campsite.\n" +
            "* Explore Kasol market and its Israeli cafés.\n" +
            "* Walk along the Parvati river.\n" +
            "* Bonfire and DJ night by the river, with group games and photographs.\n\n" +
            "⛺ Overnight Stay: Riverside campsite, Kasol\n" +
            "🍽️ Meals Included: Breakfast & Dinner\n\n" +
            "📌 Points to note:\n" +
            "* Rafting is weather and water-level dependent and is not included.\n" +
            "* Camps are basic by design — comfortable, but not a hotel.\n",
    },
    {
        day: 5,
        title: "Chalal Trek, Manikaran & Departure for Delhi",
        description:
            "* Breakfast at the campsite.\n" +
            "* Short trek to Chalal village along a quiet forest and riverside trail.\n" +
            "* Visit Manikaran Sahib Gurudwara and its hot springs.\n" +
            "* Free time at Kasol's cafés — Evergreen, Moon Dance and Café 1947.\n" +
            "* Leave for Delhi around 4:30 PM.\n" +
            "* Overnight journey.\n\n" +
            "🚌 Overnight: On the coach\n" +
            "🍽️ Meals Included: Breakfast\n\n" +
            "📌 Points to note:\n" +
            "* Heads must be covered at the gurudwara; scarves are available there.\n",
    },
    {
        day: 6,
        title: "Arrival in Delhi",
        description:
            "* Continue the journey from Kasol to Delhi, roughly 11 to 12 hours.\n" +
            "* Games, karaoke and a trip recap on the way.\n" +
            "* Arrive in Delhi.\n\n" +
            "🍽️ Meals Included: None\n" +
            "⏱️ Journey: 11–12 hrs\n\n" +
            "📌 Points to note:\n" +
            "* Arrival time varies with traffic and road conditions; do not book a same-day onward flight or train.\n",
    },
]

const pkg = {
    title: "Manali, Solang & Kasol Group Trip from Delhi | Chalal & Manikaran",
    description:
        "A 3 Nights / 4 Days group trip through Himachal, out of Delhi on an overnight coach — two nights in a Manali hotel, one in a riverside camp at Kasol, with Solang Valley, the Atal Tunnel, the Chalal trek and Manikaran Sahib in between. Bonfires, DJ nights and a group that leaves as strangers.",
    price: PRICE,
    originalPrice: ORIGINAL_PRICE,
    duration: "3N/4D",
    cities: "Delhi → Manali → Solang → Kasol → Chalal → Manikaran → Delhi",
    image: stock("manali-town-snowpeaks"),
    mapImage: "",
    galleryImages: [
        "solang-paragliding",
        "solang-snow-group",
        "manali-valley-river",
        "manali-old-cafe-street",
        "kasol-riverside",
        "parvati-valley-river",
        "kasol-town-mountains",
        "parvati-river-forest",
        "manali-pine-mountain",
    ].map(stock).join(","),
    highlights:
        "🪂 Adventure day at Solang Valley — paragliding, zorbing, and snow scooter or ATV rides by season.\n" +
        "🛣️ Drive through the Atal Tunnel to Sissu, weather and road permitting.\n" +
        "⛺ A night at a riverside campsite on the Parvati at Kasol, with a bonfire and DJ night.\n" +
        "🥾 Short trek to Chalal village on a quiet forest and riverside trail.\n" +
        "🙏 Manikaran Sahib Gurudwara and its hot springs.\n" +
        "🛕 Hadimba Devi Temple, the Tibetan monasteries and Vashisht's hot spring in Manali.\n" +
        "☕ Old Manali café street and Kasol's Israeli cafés — Evergreen, Moon Dance and Café 1947.\n" +
        "🍽️ Four breakfasts and three unlimited buffet dinners included.",
    specialNotes:
        "🚌 Overnight Journeys: The trip is sold as 3 nights and 4 days of stay, with two additional overnight coach journeys either side — out of Delhi on the first night and back from Kasol on the last. Do not book a same-day onward flight or train on the return.\n" +
        "📍 Boarding Point: Majnu Ka Tilla bus stand, near Vidhan Sabha metro, Delhi, between 7:00 and 7:30 PM.\n" +
        "💳 Booking: Reserve a seat with 35% of the tour cost as advance. The balance is payable on Day 1 at the boarding point.\n" +
        "⚠️ Payment: The full balance must be cleared at the start of the trip. If it is not, Travplan cannot hold the properties reserved at the time of booking.\n" +
        "🏨 Accommodation: Hotels and camps are confirmed once the advance is received. If a property is unavailable, a similar option is provided. Early check-in is always subject to availability.\n" +
        "🗺️ Itinerary: Only the places listed in the itinerary are covered. Anywhere else is at your own arrangement and cost.\n" +
        "🌧️ Weather: No refund is given for sightseeing cancelled by bad weather or circumstances beyond our control.\n" +
        "🚧 Delays: No compensation is given for delays caused by roadblocks, natural calamities or personal reasons, and the cost of alternative accommodation in those cases is borne by the guest.\n" +
        "🛶 Rafting: On a group tour, rafting is time-consuming and is only added when the whole group agrees. It is not included in the package.\n" +
        "🧯 Conduct: Travplan may end a guest's trip for unacceptable behaviour, with no refund.\n" +
        "🛏️ Damages: The person making the booking is liable for damage to room, camp or resort furnishings and for the cost of replacement.\n" +
        "✈️ Flights: Travplan is not responsible for flight delays, including on flight-inclusive plans.\n" +
        "🔥 Extra Charges: Room heater charges, monument and camera fees, and any adventure sport are paid separately.",
    tourType: "Friends, Adventure",
    tourCategory: "GROUP",
    maxPersons: 30,
    accommodation: "Hotel & Campsite",
    discountPercent: 0,
    tags:
        "#Manali #Kasol #SolangValley #Manikaran #Chalal #AtalTunnel #ParvatiValley #HimachalPradesh " +
        "#GroupTrip #BackpackingIndia #RiversideCamping #DelhiToManali #WeekendGetaway #AdventureTravel " +
        "#MountainTrip #Travplan",
    isCustomizable: false,
    bestPrice: true,
    flightsIncluded: false,
    departureDates: "[]",
    departureType: "Fixed",
    departurePoints: "Delhi, Chandigarh",
    itinerary: JSON.stringify(itinerary),
    inclusions:
        "* Travel and all transfers by vehicle, sized to the group.\n" +
        "* Sightseeing and transfers as per the itinerary.\n" +
        "* 2 nights' accommodation at a hotel in Manali.\n" +
        "* 1 night's accommodation at a campsite in Kasol.\n" +
        "* 4 breakfasts and 3 dinners, served as an unlimited buffet.\n" +
        "* All toll taxes.\n" +
        "* Driver allowance and parking charges.\n",
    exclusions:
        "* Personal expenses such as tips, telephone calls, laundry and medication.\n" +
        "* Monument entry fees and camera fees.\n" +
        "* Any adventure sport.\n" +
        "* Room heater charges.\n" +
        "* Early check-in, which is subject to availability.\n" +
        "* Meals other than those listed under Inclusions.\n" +
        "* Anything not specifically mentioned under Inclusions.\n",
    cancellationPolicy:
        "* The booking amount is non-refundable.\n" +
        "* 30–20 days before departure: 50% of the total tour cost is charged.\n" +
        "* 19–10 days before departure: 75% of the total tour cost is charged.\n" +
        "* 10–1 days before departure: 100% of the total tour cost is charged.\n" +
        "* Tour dates cannot be changed once booked. The tour may be postponed if it is cancelled by a natural calamity, government restriction, pandemic, riot or war.\n",
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
