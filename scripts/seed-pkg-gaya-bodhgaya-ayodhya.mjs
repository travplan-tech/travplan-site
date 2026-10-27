/**
 * Seeds the Gaya → Bodh Gaya → Varanasi → Prayagraj → Ayodhya 4N/5D package.
 *
 * Shares the Varanasi – Ayodhya destination with the 3N/4D trip, so the
 * destination page carries two tours rather than two pages carrying one each.
 *
 *   node --env-file=.env.local scripts/seed-pkg-gaya-bodhgaya-ayodhya.mjs <price> [originalPrice]
 *
 * Re-runnable: matched on title, so a second run updates rather than duplicates.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const PRICE = Number(process.argv[2])
const ORIGINAL_PRICE = process.argv[3] ? Number(process.argv[3]) : null

if (!Number.isFinite(PRICE) || PRICE <= 0) {
    console.error("usage: node --env-file=.env.local scripts/seed-pkg-gaya-bodhgaya-ayodhya.mjs <price> [originalPrice]")
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

const DESTINATION_NAME = "Varanasi – Ayodhya, India"

const IMAGE = stock("bodhgaya-mahabodhi-temple")
const GALLERY = [
    "bodhgaya-great-buddha",
    "bodhgaya-monks-prayer",
    "varanasi-ganga-aarti-lamps",
    "varanasi-ghats-temples",
    "varanasi-ghats-boats",
    "prayagraj-sangam-ritual",
    "prayagraj-sangam-boats",
    "ayodhya-ram-ki-paidi",
    "ayodhya-deity-garlands",
].map(stock).join(",")

const itinerary = [
    {
        day: 1,
        title: "Gaya to Bodh Gaya | Spiritual Beginnings at the Land of Enlightenment",
        description:
            "* Arrive at Gaya Airport or Railway Station, where our representative will receive you and assist with a comfortable transfer.\n" +
            "* Seek blessings at the sacred Vishnupad Temple in Gaya, dedicated to Lord Vishnu.\n" +
            "* Explore the holy Akshay Vat and other important religious sites in Gaya.\n" +
            "* Drive on to Bodh Gaya, the most revered Buddhist pilgrimage site in the world.\n" +
            "* Visit the Mahabodhi Temple and the Bodhi Tree, the UNESCO World Heritage Site where Lord Buddha attained enlightenment.\n" +
            "* Explore the beautiful Thai Monastery and other Buddhist monasteries in the area.\n" +
            "* Check in to the hotel and relax after a spiritually enriching day.\n\n" +
            "🏨 Overnight Stay: Gaya\n" +
            "🍽️ Meals Included: None\n" +
            "🚗 Travel Time: ~2–3 hrs (15 km)\n" +
            "⛰️ Altitude: 110 m (Gaya)\n" +
            "🌡️ Weather: 15–32°C (Pleasant)\n\n" +
            "📍 Places you'll visit: Vishnupad Temple (Gaya), Akshay Vat (Gaya), Mahabodhi Temple (Bodh Gaya), Thai Monastery (Bodh Gaya)\n\n" +
            "📌 Points to note:\n" +
            "* Pickup time will be coordinated as per your arrival schedule.\n" +
            "* The sequence of sightseeing may vary based on arrival time and local conditions.\n" +
            "* Dress modestly while visiting temples and monasteries.\n" +
            "* Keep water, snacks and personal medicines handy.\n",
    },
    {
        day: 2,
        title: "Bodh Gaya to Varanasi | From Enlightenment to Eternal Devotion",
        description:
            "* Enjoy breakfast at the hotel in Bodh Gaya.\n" +
            "* Subject to time, explore any remaining Buddhist monasteries and temples in Bodh Gaya, such as the Tibetan Monastery or the Japanese Temple.\n" +
            "* After check-out, proceed towards Varanasi, one of the world's oldest living cities, known for its spiritual energy and cultural heritage.\n" +
            "* On arrival in Varanasi, check in at the hotel and relax.\n" +
            "* In the evening, witness the mesmerising Ganga Aarti at Dashashwamedh Ghat, a divine and unforgettable experience.\n" +
            "* Return to the hotel for a comfortable overnight stay.\n\n" +
            "🏨 Overnight Stay: Varanasi\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Travel Time: ~5–6 hrs (260 km)\n" +
            "⛰️ Altitude: 80 m (Varanasi)\n" +
            "🌡️ Weather: 15–32°C (Pleasant)\n\n" +
            "📌 Points to note:\n" +
            "* The sequence of sightseeing may vary based on arrival time and local conditions.\n" +
            "* Ganga Aarti is subject to weather conditions.\n" +
            "* Keep some cash handy for local shopping.\n",
    },
    {
        day: 3,
        title: "Varanasi Sightseeing | Temples, Traditions & Timeless Spirituality",
        description:
            "* Enjoy breakfast at the hotel in Varanasi.\n" +
            "* Seek blessings at the sacred Kashi Vishwanath Temple, one of the twelve Jyotirlingas.\n" +
            "* Explore the famous Annapurna Temple, dedicated to Goddess Annapurna.\n" +
            "* Experience the spiritual charm of Varanasi's ancient ghats along the Ganga.\n" +
            "* Subject to time, witness the mesmerising Ganga Aarti at Dashashwamedh Ghat.\n" +
            "* Return to your hotel for a comfortable overnight stay.\n\n" +
            "🏨 Overnight Stay: Varanasi\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Travel Time: ~4–5 hrs of local sightseeing\n" +
            "⛰️ Altitude: 80 m (Varanasi)\n" +
            "🌡️ Weather: 15–32°C (Pleasant)\n\n" +
            "📍 Places you'll visit: Kashi Vishwanath Temple, Annapurna Temple, Dashashwamedh Ghat (Ganga Aarti)\n\n" +
            "📌 Points to note:\n" +
            "* Ganga Aarti is subject to weather conditions and time availability.\n" +
            "* Some temples have specific dress codes.\n" +
            "* Keep water, snacks and personal medicines handy.\n",
    },
    {
        day: 4,
        title: "Varanasi to Prayagraj to Ayodhya | A Journey of Faith, Heritage and Sacred Rivers",
        description:
            "* Enjoy breakfast at the hotel and check out.\n" +
            "* Drive to Prayagraj, the sacred city of the Triveni Sangam.\n" +
            "* Experience the holy confluence of the Ganga, the Yamuna and the mythical Saraswati at Triveni Sangam.\n" +
            "* Later, drive towards Ayodhya, the birthplace of Lord Ram.\n" +
            "* On arrival, check in at your hotel in Ayodhya, relax and freshen up.\n" +
            "* Subject to timing, visit Ram Ki Paidi in the evening and attend the Saryu Aarti.\n" +
            "* Return to the hotel for a comfortable overnight stay.\n\n" +
            "🏨 Overnight Stay: Ayodhya\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Travel Time: ~5–6 hrs (225 km)\n" +
            "⛰️ Altitude: 198 m (Prayagraj), 113 m (Ayodhya)\n" +
            "🌡️ Weather: 15–32°C (Pleasant)\n\n" +
            "💡 TravPlan Insider: From the spiritual confluence at Prayagraj to the divine city of Ayodhya, this day takes you through two of India's most revered destinations, offering a unique blend of faith, history and devotion.\n\n" +
            "📍 Places you'll visit: Triveni Sangam (Prayagraj), Ram Ki Paidi (Ayodhya, optional)\n\n" +
            "📌 Points to note:\n" +
            "* Time at Prayagraj and local sightseeing may vary based on arrival time.\n" +
            "* Saryu Aarti is subject to time availability.\n" +
            "* Keep water, snacks and personal medicines handy.\n",
    },
    {
        day: 5,
        title: "Ayodhya & Departure | The Birthplace of Lord Ram",
        description:
            "* Enjoy breakfast at the hotel and check out.\n" +
            "* Seek divine blessings at the grand Shri Ram Janmabhoomi Mandir, the most revered site in Ayodhya.\n" +
            "* Visit the ancient Hanuman Garhi, dedicated to Lord Hanuman.\n" +
            "* Explore the beautifully adorned Kanak Bhawan, believed to have been a gift to Sita Mata from Queen Kaikeyi.\n" +
            "* Subject to time, spend a peaceful while at Saryu Ghat and experience the serene evening aarti.\n" +
            "* Later, proceed for your drop at Ayodhya Railway Station or Airport, or another location of your choice.\n\n" +
            "✈️ Drop Point: Ayodhya Railway Station / Airport\n" +
            "🍽️ Meals Included: Breakfast\n" +
            "🚗 Travel Time: Local drive\n" +
            "⛰️ Altitude: 113 m\n" +
            "🌡️ Weather: 15–32°C (Pleasant)\n\n" +
            "💡 TravPlan Insider: Ayodhya is the sacred birthplace of Lord Ram, known for its grand temples, rich heritage and spiritual charm. A visit here is a journey into faith, devotion and India's timeless culture.\n\n" +
            "📍 Places you'll visit: Shri Ram Janmabhoomi Mandir, Hanuman Garhi, Kanak Bhawan\n\n" +
            "📌 Points to note:\n" +
            "* Temple darshan timings may vary.\n" +
            "* Saryu Aarti is subject to time availability.\n" +
            "* Dress modestly while visiting temples.\n",
    },
]

const pkg = {
    title: "Bodh Gaya, Varanasi & Ayodhya | Buddhist Trail to the Birthplace of Lord Ram",
    description:
        "A 4 Nights / 5 Days pilgrimage across Bihar and Uttar Pradesh — the Mahabodhi Temple and Bodhi Tree at Bodh Gaya, the evening Ganga Aarti at Varanasi's Dashashwamedh Ghat, the Triveni Sangam at Prayagraj, and the Shri Ram Janmabhoomi Mandir at Ayodhya. Arrive at Gaya, depart from Ayodhya, and cover four of India's most sacred cities in one unhurried route.",
    price: PRICE,
    originalPrice: ORIGINAL_PRICE,
    duration: "4N/5D",
    cities: "Gaya → Bodh Gaya → Varanasi → Prayagraj → Ayodhya",
    image: IMAGE,
    mapImage: "",
    galleryImages: GALLERY,
    highlights:
        "☸️ Visit the Mahabodhi Temple and the Bodhi Tree at Bodh Gaya, the UNESCO World Heritage Site where Lord Buddha attained enlightenment.\n" +
        "🛕 Darshan at the grand Shri Ram Janmabhoomi Mandir in Ayodhya, the birthplace of Lord Ram.\n" +
        "🪔 Witness the mesmerising Ganga Aarti at Dashashwamedh Ghat in Varanasi.\n" +
        "🌊 Experience the holy confluence of the Ganga, Yamuna and mythical Saraswati at Triveni Sangam, Prayagraj.\n" +
        "🛕 Seek blessings at Kashi Vishwanath Temple, one of the twelve Jyotirlingas.\n" +
        "🙏 Visit Vishnupad Temple and the holy Akshay Vat at Gaya.\n" +
        "🏯 Explore the Thai, Tibetan and Japanese monasteries that surround Bodh Gaya.\n" +
        "🌅 Spend a peaceful evening at Ram Ki Paidi and the Saryu Ghat in Ayodhya.",
    specialNotes:
        "📞 Trip Helpline: +91 7011990884 and +91 7703896328, available 9:00 AM – 9:00 PM.\n" +
        "🚨 Emergency Support: +91 7703896328, available 24x7.\n" +
        "🚗 Driver Coordinator: Details are shared on Day 1 of the trip.\n" +
        "🙏 Respecting Sacred Spaces: This is a spiritual journey through some of India's most sacred destinations. Please respect the sanctity of temples, ghats and monasteries by following local customs, maintaining modest attire, and cooperating with site-specific guidelines.\n" +
        "🧳 Travel Essentials: Carry a valid ID proof, modest attire, a small day bag, personal medication, and both cash and digital payment.\n" +
        "🛣️ Itinerary Changes: The itinerary is subject to change based on hotel availability, traffic, local conditions and unforeseen situations. Additional sightseeing requested during the trip will be charged extra.\n" +
        "🏨 Hotel Availability: Hotels are subject to availability. In case of non-availability, accommodation will be arranged in a similar category property.\n" +
        "🪔 Aarti Timings: Ganga Aarti and Saryu Aarti are subject to weather conditions, seasonal timings and time availability on the day.\n" +
        "🗓️ Site Closures: Travellers are advised to confirm that the chosen destinations are open on their travel dates.\n" +
        "🩺 Health: All travellers must ensure they are medically fit for travel. Travel insurance is highly recommended but not included.\n" +
        "💰 Package Rates: Prices are subject to change due to revisions in hotel tariffs, transportation costs, taxes, or any modifications requested after booking.\n" +
        "📅 Best Time to Visit: October to March.\n" +
        "🌱 Travel Responsibly: Respect nature and local culture, support local communities, and take nothing but pictures.",
    tourType: "Pilgrim Tours, Family",
    tourCategory: "PRIVATE",
    maxPersons: 10,
    accommodation: "Hotels",
    discountPercent: 0,
    tags:
        "#BodhGaya #Varanasi #Ayodhya #Prayagraj #Gaya #MahabodhiTemple #BodhiTree #RamJanmabhoomi #TriveniSangam " +
        "#GangaAarti #KashiVishwanath #BuddhistCircuit #PilgrimTour #SpiritualTravel #SacredIndia #Bihar #UttarPradesh " +
        "#IncredibleIndia #TempleTour #PrivateTour #Travplan",
    isCustomizable: true,
    bestPrice: true,
    flightsIncluded: false,
    departureDates: "[]",
    departureType: "Flexible",
    departurePoints: "Gaya",
    itinerary: JSON.stringify(itinerary),
    inclusions:
        "* Accommodation for 4 nights on twin/triple sharing basis.\n" +
        "* Daily breakfast at the hotel.\n" +
        "* All transfers and sightseeing by private vehicle as per the itinerary.\n" +
        "* Pickup from Gaya Railway Station / Airport.\n" +
        "* Drop at Ayodhya Railway Station / Airport, or a location of your choice.\n" +
        "* Gaya and Bodh Gaya sightseeing as mentioned in the itinerary.\n" +
        "* Varanasi local sightseeing and the Sarnath excursion.\n" +
        "* Prayagraj sightseeing, including Triveni Sangam.\n" +
        "* Ayodhya local sightseeing as mentioned in the itinerary.\n" +
        "* All applicable toll taxes, parking charges and driver allowances.\n" +
        "* Fuel expenses for the vehicle.\n" +
        "* All applicable interstate and state taxes.\n" +
        "* Assistance throughout the tour.\n",
    exclusions:
        "* Airfare and train tickets.\n" +
        "* Lunch and dinner.\n" +
        "* Personal expenses such as laundry, telephone calls and room service.\n" +
        "* Boat ride at Varanasi.\n" +
        "* Any special pooja, rituals or religious ceremonies.\n" +
        "* VIP or special darshan charges at temples, where applicable.\n" +
        "* Monument, museum and sightseeing entry tickets.\n" +
        "* Camera and video camera charges wherever applicable.\n" +
        "* Guide charges.\n" +
        "* Any additional sightseeing not mentioned in the itinerary.\n" +
        "* Expenses arising from natural calamities, roadblocks, strikes, weather conditions or other unforeseen circumstances.\n" +
        "* Any increase in taxes, fuel prices or transportation costs after confirmation.\n" +
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

const destination = await prisma.destination.findFirst({ where: { name: DESTINATION_NAME } })
if (!destination) {
    console.error(
        `destination "${DESTINATION_NAME}" not found — run seed-pkg-ayodhya-varanasi.mjs first, which creates it`
    )
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
