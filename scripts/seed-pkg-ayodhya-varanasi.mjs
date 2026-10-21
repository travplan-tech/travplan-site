/**
 * Seeds the Ayodhya & Varanasi 3N/4D package, creating its destination if the
 * row is not already there.
 *
 * Re-runnable: the destination is matched on name and the package on title, so
 * running it again updates rather than duplicating.
 *
 *   node --env-file=.env.local scripts/seed-pkg-ayodhya-varanasi.mjs <price> [originalPrice]
 *
 * Price is the one value the brochure does not carry, so it is passed in rather
 * than guessed; the script refuses to run without it so a made-up number cannot
 * reach a live booking page.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const PRICE = Number(process.argv[2])
const ORIGINAL_PRICE = process.argv[3] ? Number(process.argv[3]) : null

if (!Number.isFinite(PRICE) || PRICE <= 0) {
    console.error("usage: node --env-file=.env.local scripts/seed-pkg-ayodhya-varanasi.mjs <price> [originalPrice]")
    process.exit(1)
}

// Masters live in TravPlan/stock and are shared with the 4N/5D circuit; the
// version segment is left off so a re-upload is picked up without a code change.
const stock = (name) =>
    `https://res.cloudinary.com/dcolmsvtp/image/upload/TravPlan/stock/${name}.jpg`

const IMAGE = stock("varanasi-ghats-temples")
const GALLERY = [
    "varanasi-ganga-aarti-lamps",
    "varanasi-ganga-aarti-fire",
    "varanasi-ghats-boats",
    "varanasi-ghat-steps",
    "sarnath-dhamek-stupa-sunset",
    "sarnath-dhamek-stupa-ruins",
    "ayodhya-deity-garlands",
    "ayodhya-ram-ki-paidi",
    "ayodhya-saryu-riverfront",
].map(stock).join(",")
const MAP_IMAGE = ""

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
}

// Aiven presents a self-signed chain; lib/prisma.ts does the same for dev.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const DESTINATION = {
    name: "Varanasi – Ayodhya, India",
    city: "Varanasi – Ayodhya",
    country: "India",
    region: "Asia",
    description:
        "Varanasi and Ayodhya sit at the heart of India's pilgrimage circuit — the ghats of Kashi on the Ganga, the Buddhist stupas of Sarnath, and the Shri Ram Janmabhoomi temple a few hours north. Most itineraries pair them over three or four nights, flying into Varanasi and out of Lucknow.",
    image: IMAGE,
}

const itinerary = [
    {
        day: 1,
        title: "Arrival in Varanasi | Ganga Aarti at Dashashwamedh Ghat",
        description:
            "* Arrive at Varanasi Airport or Railway Station, where our representative will welcome you and transfer you to the hotel.\n" +
            "* Complete the check-in formalities and relax.\n" +
            "* In the evening, visit the iconic Dashashwamedh Ghat, one of the oldest and most vibrant ghats on the banks of the holy River Ganga.\n" +
            "* Witness the mesmerising Ganga Aarti at Dashashwamedh Ghat, with its lamps, chants and devotional rituals along the sacred river.\n" +
            "* Return to the hotel for a comfortable overnight stay.\n\n" +
            "🏨 Overnight Stay: Varanasi\n" +
            "🍽️ Meals Included: None\n" +
            "🚗 Total Drive: 3–4 hrs\n" +
            "🌡️ Weather: 14–32°C\n\n" +
            "💡 TravPlan Insider: Varanasi is best experienced beyond sightseeing. Take a peaceful walk along the ghats, soak in the spiritual atmosphere of Kashi, and don't miss the spectacular evening Ganga Aarti.\n\n" +
            "📌 Points to note:\n" +
            "* Hotel check-in is subject to the property's standard timings.\n" +
            "* Ganga Aarti timings may vary depending on the season.\n",
    },
    {
        day: 2,
        title: "Varanasi Full Day Sightseeing | Temples & Ghats of Kashi",
        description:
            "* Enjoy breakfast at the hotel and set out to explore the sacred city of Kashi.\n" +
            "* Visit the Kashi Vishwanath Temple, one of the twelve Jyotirlingas and the spiritual centre of Varanasi.\n" +
            "* Seek blessings at the Kal Bhairav Temple, the guardian deity of the city.\n" +
            "* Continue to the Sankat Mochan Hanuman Temple, Durga Temple, Tulsi Manas Temple, Annapurna Temple and Bharat Mata Temple.\n" +
            "* Spend time at Assi Ghat, Dashashwamedh Ghat and Manikarnika Ghat along the Ganga.\n" +
            "* Return to the hotel in the evening and unwind.\n\n" +
            "🏨 Overnight Stay: Varanasi\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Total Drive: 3–4 hrs\n" +
            "🌡️ Weather: 14–32°C\n\n" +
            "💡 TravPlan Insider: Start early to cover Varanasi's major temples and ghats comfortably. Keep some flexibility in the schedule, as temple queues, security checks and local traffic can affect sightseeing time.\n\n" +
            "📌 Points to note:\n" +
            "* The sightseeing order may be adjusted according to traffic and local conditions.\n" +
            "* Manikarnika Ghat is an active cremation site; visitors should maintain respectful behaviour and avoid intrusive photography.\n" +
            "* Some temple areas may have restrictions on mobile phones, cameras and personal belongings.\n",
    },
    {
        day: 3,
        title: "Varanasi to Ayodhya via Sarnath | Buddhist Heritage & Saryu Aarti",
        description:
            "* After breakfast, check out from the hotel and proceed to Sarnath, one of the most important Buddhist pilgrimage destinations, where Lord Buddha delivered his first sermon.\n" +
            "* Visit the magnificent Dhamek Stupa, a historic monument marking the sacred site associated with Buddha's first sermon.\n" +
            "* Explore Chaukhandi Stupa, believed to mark the place where Buddha met his first disciples after attaining enlightenment.\n" +
            "* Visit Mulagandha Kuti Vihar, a beautiful Buddhist temple known for its peaceful atmosphere, murals and spiritual significance.\n" +
            "* Stop at the Sarnath Archaeological Museum, home to the Lion Capital of Ashoka and a notable collection of Buddhist sculpture.\n" +
            "* Drive on to Ayodhya and, in the evening, visit Saryu Ghat to witness the Aarti.\n" +
            "* Check in to the hotel for an overnight stay.\n\n" +
            "🏨 Overnight Stay: Ayodhya\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Total Drive: 5–6 hrs\n" +
            "🌡️ Weather: 14–32°C\n\n" +
            "💡 TravPlan Insider: Try to complete Sarnath sightseeing in the first half of the day to allow enough time for the drive to Ayodhya. If you arrive before the evening Aarti, enjoy a peaceful walk along the Saryu River.\n\n" +
            "📌 Points to note:\n" +
            "* The transfer to Ayodhya may take several hours depending on traffic and road conditions.\n" +
            "* Saryu Ghat Aarti timings may vary according to the season and local arrangements.\n",
    },
    {
        day: 4,
        title: "Ayodhya Sightseeing & Departure | Shri Ram Janmabhoomi Mandir",
        description:
            "* After breakfast, begin your Ayodhya sightseeing with a visit to the sacred Shri Ram Janmabhoomi Mandir, one of the most significant pilgrimage sites in India.\n" +
            "* Seek blessings at Hanuman Garhi, a famous temple dedicated to Lord Hanuman, set atop a hill and reached by a flight of steps.\n" +
            "* Visit the beautiful Kanak Bhawan, dedicated to Lord Rama and Goddess Sita and known for its ornate interiors and peaceful atmosphere.\n" +
            "* Explore Dasharath Mahal, traditionally associated with King Dasharath, the father of Lord Rama, and an important religious landmark of Ayodhya.\n" +
            "* Visit Nageshwar Nath Temple, an ancient Shiva temple and one of Ayodhya's significant religious attractions.\n" +
            "* After sightseeing, proceed to Lucknow Airport or Railway Station for your onward journey.\n\n" +
            "✈️ Drop Point: Lucknow Airport / Railway Station\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Total Drive: 6–7 hrs\n" +
            "🌡️ Weather: 14–32°C\n\n" +
            "💡 TravPlan Insider: Ayodhya is best experienced at a relaxed pace. Take a moment at Saryu Ghat to soak in the peaceful atmosphere after visiting the city's most important temples.\n\n" +
            "📌 Points to note:\n" +
            "* Temple visits and darshan are subject to local timings, security guidelines and crowd conditions.\n" +
            "* Please allow sufficient time for the transfer to Lucknow Airport/Railway Station.\n",
    },
]

const pkg = {
    title: "Ayodhya & Varanasi | Sacred Journeys, Timeless Experiences",
    description:
        "A 3 Nights / 4 Days journey into the heart of faith — Varanasi's eternal ghats and evening Ganga Aarti, the Buddhist stupas of Sarnath, and the divine aura of Ayodhya's Shri Ram Janmabhoomi Mandir. Fly into Varanasi, out of Lucknow, and spend three nights across two of India's most sacred cities.",
    price: PRICE,
    originalPrice: ORIGINAL_PRICE,
    duration: "3N/4D",
    cities: "Varanasi → Sarnath → Ayodhya → Lucknow",
    image: IMAGE,
    mapImage: MAP_IMAGE,
    galleryImages: GALLERY,
    highlights:
        "🛕 Darshan at the Shri Ram Janmabhoomi Temple in Ayodhya, one of the most significant pilgrimage sites in India.\n" +
        "🪔 Witness the divine evening Ganga Aarti at Dashashwamedh Ghat, with its lamps, chants and devotional rituals.\n" +
        "🌊 Spend time along the ghats of Kashi — Assi, Dashashwamedh and Manikarnika — on the banks of the holy Ganga.\n" +
        "☸️ Explore Sarnath, where Lord Buddha delivered his first sermon, including the Dhamek and Chaukhandi Stupas.\n" +
        "🛕 Visit the Kashi Vishwanath Temple, one of the twelve Jyotirlingas and the spiritual centre of Varanasi.\n" +
        "🌅 Witness the evening Aarti at Saryu Ghat in Ayodhya.\n" +
        "🏛️ Discover ancient temples and the rich cultural heritage of Uttar Pradesh's pilgrimage circuit.",
    specialNotes:
        "🧳 Travel Essentials: Carry a valid ID proof, modest attire for temple visits, a small day bag, personal medication, both cash and digital payment, and any spiritual essentials you wish to bring.\n" +
        "🙏 Respecting Sacred Spaces: This is a spiritual journey through some of India's most sacred destinations. Please respect the sanctity of temples, ghats and religious spaces by following local customs, maintaining appropriate attire, and cooperating with site-specific guidelines.\n" +
        "🕰️ Cab Timings: Cab service runs from 7:00 AM to 7:00 PM, or until the day's sightseeing is complete as per the itinerary.\n" +
        "🚗 Driver Details: Driver details will be shared one day before arrival.\n" +
        "🛣️ Itinerary Changes: The itinerary is subject to change based on hotel availability, traffic, local conditions and unforeseen situations. Additional sightseeing requested during the trip will be charged extra.\n" +
        "🏨 Hotel Availability: Hotels are subject to availability. In case of non-availability, accommodation will be arranged in a similar category property.\n" +
        "🗓️ Site Closures: Travellers are advised to confirm that the chosen destinations are open on their travel dates. TravPlan is not responsible for any site closed during the trip.\n" +
        "🩺 Health: All travellers must ensure they are medically fit for travel. Travel insurance is highly recommended but not included.\n" +
        "💰 Package Rates: Prices are subject to change due to revisions in hotel tariffs, transportation costs, taxes, or any modifications requested after booking.\n" +
        "🎟️ Optional Activities: Travellers booking optional activities such as boat rides or shows do so at their own risk and expense.\n" +
        "📅 Best Time to Visit: January to December. Expect cold and tropical weather depending on the season.",
    tourType: "Pilgrim Tours, Family",
    tourCategory: "PRIVATE",
    maxPersons: 10,
    accommodation: "Hotels",
    discountPercent: 0,
    tags:
        "#Ayodhya #Varanasi #Kashi #SacredJourneys #RamJanmabhoomi #GangaAarti #Sarnath #KashiVishwanath #SaryuGhat " +
        "#SpiritualTravel #PilgrimTour #TempleTour #UttarPradesh #IncredibleIndia #DivineIndia #TravelIndia #PrivateTour " +
        "#FaithAndHeritage #BuddhistHeritage #Travplan",
    isCustomizable: true,
    bestPrice: true,
    flightsIncluded: false,
    departureDates: "[]",
    departureType: "Flexible",
    departurePoints: "Varanasi",
    itinerary: JSON.stringify(itinerary),
    inclusions:
        "* 3 nights accommodation.\n" +
        "* 3 breakfasts.\n" +
        "* Varanasi pickup from Airport/Railway Station on Day 1.\n" +
        "* Lucknow drop at Airport/Railway Station on Day 4.\n" +
        "* All sightseeing and transfers by private vehicle as per the itinerary.\n" +
        "* All applicable driver allowance, toll tax, parking charges and fuel expenses.\n",
    exclusions:
        "* Airfare / train fare.\n" +
        "* Lunch and dinner.\n" +
        "* Any boat ride on the Ganga or at Triveni Sangam.\n" +
        "* Monument and temple entry charges wherever applicable.\n" +
        "* Personal expenses such as laundry, telephone calls, shopping, tips, porterage and beverages.\n" +
        "* Travel insurance.\n" +
        "* Medical expenses and emergency evacuation.\n" +
        "* Expenses arising due to flight or train delays and cancellations, roadblocks, weather conditions, or any force majeure events.\n" +
        "* Anything not specifically mentioned under Inclusions.\n",
    cancellationPolicy:
        "* 30 days or more before departure: Full refund after deducting a 10% administrative fee.\n" +
        "* 15–29 days before departure: 50% of the total trip cost will be charged.\n" +
        "* 7–14 days before departure: 75% of the total trip cost will be charged.\n" +
        "* Less than 7 days before departure or no-show: 100% of the total trip cost will be charged. No refund will be provided.\n" +
        "* No refunds are provided for unutilised services.\n",
    priceChartImage: "",
}

// --------------------------------------------------------------------- seed

const destination =
    (await prisma.destination.findFirst({ where: { name: DESTINATION.name } })) ??
    (await prisma.destination.create({ data: DESTINATION }))

if (destination.createdAt.getTime() === destination.updatedAt.getTime()) {
    console.log(`created destination ${destination.id} — ${destination.name}`)
} else {
    console.log(`using destination ${destination.id} — ${destination.name}`)
}

const existing = await prisma.package.findFirst({ where: { title: pkg.title } })

const saved = existing
    ? await prisma.package.update({ where: { id: existing.id }, data: { ...pkg, destinationId: destination.id } })
    : await prisma.package.create({ data: { ...pkg, destinationId: destination.id } })

console.log(`${existing ? "updated" : "created"} package ${saved.id} — ${saved.title}`)

// Keep the destination's tour count in step with what is actually there.
const tours = await prisma.package.count({ where: { destinationId: destination.id } })
await prisma.destination.update({ where: { id: destination.id }, data: { tours } })
console.log(`destination now lists ${tours} tour${tours === 1 ? "" : "s"}`)

console.log(`\nlive at /destinations/trip/${saved.id} once the page revalidates`)

await prisma.$disconnect()
await pool.end()
