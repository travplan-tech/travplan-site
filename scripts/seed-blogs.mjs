/**
 * Seeds the travel guides. Re-runnable: each post is upserted on its slug, so
 * running this again updates the existing row rather than creating duplicates.
 *
 *   node --env-file=.env.local scripts/seed-blogs.mjs
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
}

// Aiven presents a self-signed chain; lib/prisma.ts does the same for dev.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const posts = [
    {
        slug: "best-time-to-visit-meghalaya",
        destinationCity: "Meghalaya",
        title: "Best Time to Visit Meghalaya: Dawki's Clear Water vs Waterfall Season",
        excerpt:
            "Meghalaya gives you two different holidays depending on when you go — roaring monsoon waterfalls, or Dawki's famous glass-clear Umngot River. Here is how to choose.",
        metaTitle: "Best Time to Visit Meghalaya: Dawki vs Waterfall Season | Travplan",
        metaDescription:
            "When to visit Meghalaya: monsoon for waterfalls, November to April for Dawki's clear water, and October to November for the best of both.",
        coverImage:
            "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=80",
        tags: "Meghalaya, Best Time to Visit, Dawki, North East India",
        readingMinutes: 6,
        content: `Meghalaya has a slightly unusual travel dilemma.

Do you visit when its waterfalls are roaring at full force, or wait for the monsoon to disappear and see Dawki's famous crystal-clear Umngot River?

You can have both — but not quite at their peak. The best time to visit Meghalaya depends entirely on what you want to see.

## June to September: Go for the Waterfalls

If your dream Meghalaya looks like mist-covered hills, overflowing waterfalls and impossibly green landscapes, monsoon is the season for you.

Between June and September, places around Cherrapunji (Sohra) and Mawsynram receive intense rainfall. Waterfalls such as Nohkalikai, Seven Sisters and Kynrem become dramatically fuller, while the entire landscape turns deep green.

But there's a trade-off.

Heavy rain can mean slippery trails, poor visibility, road disruptions and changing travel conditions. The Umngot River at Dawki also becomes high and silty, so the famous clear-water effect isn't what you'll see during peak monsoon.

**Choose this season if:** waterfalls and lush landscapes matter more to you than clear skies and boating.

## October to November: The Sweet Spot

This is arguably the most interesting period for a first Meghalaya trip.

The monsoon starts retreating, the landscape is still beautifully green and the waterfalls retain some of their post-monsoon volume. At the same time, roads and outdoor activities become more manageable.

October and November are widely considered the best balance between waterfalls, greenery, clearer skies and comfortable sightseeing.

Dawki also starts transitioning towards its clear-water season, although the Umngot is generally at its clearest later in the year.

**Choose this season if:** you want a little bit of everything.

## November to April: Come for Dawki

If that viral photograph of a boat seemingly floating above the water is what made you want to visit Meghalaya, aim for the dry season.

The Umngot River at Dawki is generally clearest from November to April, with particularly good clarity during the winter months. If you are planning a trip to Meghalaya in December, lower rainfall allows sediment to settle, making the river much more transparent.

For the best experience, reach the river early in the morning when the water is calmer and there are fewer boats around.

You can also head to Shnongpdeng, a quieter stretch of the Umngot where you can combine the clear river with kayaking, camping and other outdoor activities.

**Choose this season if:** clear water, boating and outdoor activities are your priority.

## So, When Should You Actually Go?

Here's the simplest way to decide:

- **June–September:** Maximum waterfalls + dramatic monsoon greenery
- **October:** Best transition period + greenery + waterfalls + improving weather
- **November–February:** Clearest Dawki water + comfortable sightseeing + winter atmosphere
- **March–April:** Clear skies + pleasant weather + fewer crowds than the peak winter period

If you're visiting Meghalaya for the first time, October–November is arguably the best compromise. If Dawki is the main reason for your trip, push your travel towards November–March.

## What Should You See in Each Season?

### During Monsoon

- Nohkalikai Falls
- Seven Sisters Falls
- Kynrem Falls
- Cherrapunji
- Mawsynram
- Lush living-root-bridge landscapes

### During the Dry Season

- Dawki & Umngot River
- Shnongpdeng
- Mawlynnong
- Living Root Bridges
- Krang Suri
- Shillong
- Sohra viewpoints

One important point: waterfall volume and river clarity don't peak together. The same rain that makes Meghalaya's waterfalls spectacular is also what makes the Umngot muddy.

That's the real seasonal trade-off.

## FAQs

### What is the best month to visit Meghalaya?

For an all-round trip, October and November are excellent choices. Finding the best month comes down to balancing weather and sights — during these months, you get post-monsoon greenery, improving weather and waterfalls that can still be impressive.

### When is Dawki River the clearest?

The Umngot River is generally clearest from November to April, with peak clarity during the winter months.

### When are Meghalaya's waterfalls at their best?

June to September is the best period for maximum waterfall flow because of the southwest monsoon.

### Can I see waterfalls and clear water in the same trip?

Yes. October–November offers the best compromise. The waterfalls can still have good post-monsoon flow while Dawki begins moving towards clearer conditions.

### Is Dawki worth visiting during monsoon?

The surrounding landscape is incredibly green, but the Umngot may be muddy and boating can be affected by heavy rainfall and river conditions. If clear water is your priority, wait until the dry season.

### How many days are enough for Meghalaya?

5–7 days works well for a first trip covering Shillong, Sohra, Mawlynnong and Dawki/Shnongpdeng without rushing.

## Final Take

Meghalaya essentially gives you two different holidays depending on when you visit.

Come during the monsoon for waterfalls at their wildest. Wait until the rains retreat for clear skies, calmer roads and Dawki's famous glass-like river.

And if you don't want to choose between the two, October and November are your sweet spot.`,
    },
    {
        slug: "guwahati-to-tawang-itinerary",
        destinationCity: "Tawang",
        title: "Guwahati to Tawang: 7-Day Itinerary, Trip Cost & Permit Checklist",
        excerpt:
            "A 7-day Guwahati–Tawang road trip across Bhalukpong, Bomdila, Dirang and Sela Pass — with a realistic cost breakdown and the permits you need before you leave.",
        metaTitle: "Guwahati to Tawang: 7-Day Itinerary, Cost & Permits | Travplan",
        metaDescription:
            "Plan a Guwahati to Tawang road trip: 7-day itinerary via Bomdila, Dirang and Sela Pass, a per-person cost breakdown, and the ILP and Bum La permit checklist.",
        coverImage:
            "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1600&q=80",
        tags: "Tawang, Arunachal Pradesh, Itinerary, Road Trip, North East India",
        readingMinutes: 8,
        content: `Planning a road trip from Guwahati to Tawang? This is one of those journeys where the route is as memorable as the destination. From the plains of Assam, you gradually climb through Bhalukpong, Bomdila and Dirang before crossing Sela Pass and reaching the high-altitude landscapes of Tawang.

The key is not to rush it. A 7-day plan gives you enough time for the major sights while keeping the long mountain drives manageable.

## Guwahati to Tawang Route

The usual route is: **Guwahati → Tezpur → Bhalukpong → Bomdila → Dirang → Sela Pass → Tawang**

Tawang is around 488 km from Guwahati by road, but the journey takes much longer than the distance suggests because of winding mountain roads and high-altitude sections. Checking the Guwahati to Tawang distance for each leg helps set realistic drive times.

## 7-Day Tawang Itinerary

### Day 1: Guwahati → Bhalukpong

Start early from Guwahati and drive towards Tezpur and Bhalukpong, the gateway into Arunachal Pradesh.

**Overnight:** Bhalukpong/Nameri · **Drive:** Around 5–6 hours

Keep your ILP ready, as it is required for entry into Arunachal Pradesh for Indian visitors from outside the state.

### Day 2: Bhalukpong → Bomdila → Dirang

The landscape changes dramatically as you enter the mountains. Stop at Bomdila before continuing towards Dirang. Spend the evening exploring the valley or visiting the local hot springs.

**Overnight:** Dirang · **Drive:** Around 6 hours

Dirang is also an important acclimatisation stop before heading towards Tawang's higher altitude. Tawang Tourism recommends a night halt in Bomdila or Dirang before continuing upwards.

### Day 3: Dirang → Sela Pass → Tawang

This is the most scenic day of the journey. Cross Sela Pass, stop at Jaswant Garh War Memorial and continue towards Tawang, with a possible stop at Nuranang Falls depending on road and weather conditions.

**Overnight:** Tawang · **Drive:** Around 6–7 hours

### Day 4: Explore Tawang

Keep this day relatively relaxed. Visit:

- Tawang Monastery
- Tawang War Memorial
- Urgelling Monastery
- Tawang market
- Local viewpoints

Don't pack too much into the day. You're already at high altitude, so a slower pace is a better idea.

### Day 5: Bum La Pass + PT Tso + Sangetsar Lake

This is your high-altitude excursion day. The route generally covers PT Tso Lake, Bum La Pass and Sangetsar (Madhuri) Lake. Bum La is above 15,000 ft and requires a special permit from the Deputy Commissioner's office, followed by Army formalities.

**Overnight:** Tawang

### Day 6: Tawang → Dirang/Bomdila

Start early and retrace your route through Sela towards Dirang or Bomdila.

**Overnight:** Dirang/Bomdila

This overnight stop is important because trying to drive all the way to Guwahati after leaving Tawang can make the final day unnecessarily exhausting.

### Day 7: Dirang/Bomdila → Guwahati

Complete the final leg through Bhalukpong and Tezpur to Guwahati. If you have a flight that evening, keep a comfortable buffer because mountain-road delays are possible.

## Tawang Trip Cost from Guwahati

Your biggest expense will be transportation. For a 7-day trip, a practical mid-range estimate is around ₹25,000–₹35,000 per person, assuming 3–4 people share a private SUV.

| Expense | Approx. cost per person |
| --- | --- |
| Shared/private SUV | ₹6,000–₹10,000 |
| Hotels/homestays | ₹7,000–₹12,000 |
| Food | ₹3,000–₹5,000 |
| ILP & local permits | ₹500–₹2,000 |
| Bum La excursion | ₹1,500–₹3,000 |
| **Estimated total** | **₹18,000–₹32,000** |

Keep some extra money for weather-related changes, additional sightseeing or transport changes. Sharing a private vehicle significantly reduces the per-person cost.

## Tawang Permit Checklist

Before leaving for the trip, keep these ready:

1. **Arunachal Pradesh ILP** — Indian tourists from outside Arunachal Pradesh need an Inner Line Permit. The government eILP system allows online applications with an ID document and recent photograph. The tourist eILP portal currently lists a fee of ₹300 for stays up to 3 days and ₹500 for stays beyond 3 days up to 14 days.
2. **Bum La Permit** — A separate permit is required for Bum La. It is issued through the DC's office in Tawang and must also be countersigned by the Army.
3. **ID Proof** — Carry the same original ID used for your ILP, along with physical or printed copies of your permit.
4. **Foreign travellers** — Foreign nationals need a Protected Area Permit (PAP) rather than the domestic tourist ILP.

## Best Time for a Tawang Trip

March–May and October–November are widely recognised as the most popular windows for relatively comfortable road conditions and pleasant sightseeing. Winter can bring snow and very cold conditions, while monsoon travel can be affected by rain and road conditions.

If your main goal is snow, winter offers the best chance, but road and weather conditions can change quickly.

## FAQs

### How many days are enough for Guwahati to Tawang?

7 days works well for a first trip, including the return journey and a Bum La excursion.

### Is ILP mandatory for Tawang?

Yes. Indian visitors from outside Arunachal Pradesh need an Arunachal Pradesh ILP.

### Can I visit Bum La without a separate permit?

No. Bum La requires a special permit and Army countersignature.

### Is Tawang safe for first-time mountain travellers?

Yes, but altitude should be taken seriously. Stay hydrated, avoid rushing, and allow your body time to adjust before going to very high-altitude areas.

### Should I hire a private car or take shared transport?

A private SUV is more comfortable and flexible, especially for a 7-day itinerary. Shared vehicles are cheaper but offer less control over timings and stops.

### What should I pack for Tawang?

Carry warm layers, gloves, a cap, sunglasses, sunscreen, comfortable shoes, medicines and a power bank. Weather can change quickly at higher elevations.

## Final Take

A Guwahati–Tawang trip isn't about reaching Tawang as quickly as possible. Dirang, Sela Pass, the mountain roads and the high-altitude lakes are part of the experience. Plan your permits in advance, keep one acclimatisation night, and don't make the mistake of squeezing the entire circuit into a few rushed days.

For a first visit, 7 days is a good balance between sightseeing, road time and actually enjoying the mountains.`,
    },
    {
        slug: "kerala-trip-cost-5-days",
        destinationCity: "Kerala",
        title: "Kerala Trip Cost for 5 Days: Munnar–Alleppey Itinerary & Houseboat Budget",
        excerpt:
            "A 5-day Munnar–Alleppey plan with a realistic per-person cost breakdown, houseboat categories and tariffs, and how to keep the backwater night affordable.",
        metaTitle: "Kerala Trip Cost for 5 Days: Munnar–Alleppey Budget | Travplan",
        metaDescription:
            "A 5-day Kerala itinerary covering Munnar and Alleppey, with a per-person cost breakdown, houseboat price ranges and tips to keep the budget down.",
        coverImage:
            "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80",
        tags: "Kerala, Munnar, Alleppey, Trip Cost, Houseboat, Itinerary",
        readingMinutes: 7,
        content: `If you want a short Kerala holiday that gives you both mountains and backwaters, the Munnar–Alleppey combination is hard to beat. In five days, you can go from misty tea plantations to a traditional houseboat floating through Kerala's palm-lined canals.

For a comfortable mid-range trip, keep roughly ₹20,000–₹30,000 per person, excluding flights or trains to Kerala. Your biggest variable will be the private cab and houseboat category.

## 5-Day Munnar–Alleppey Itinerary

### Day 1: Kochi → Munnar

Arrive in Kochi and drive towards Munnar. The journey takes roughly 4–5 hours, depending on traffic and stops. On the way, you can stop at Cheeyappara and Valara waterfalls and nearby spice plantations. Reach Munnar by evening and keep the rest of the day relaxed.

**Overnight:** Munnar

### Day 2: Munnar Sightseeing

Start early and spend the day exploring Munnar. Visit Mattupetty Dam, Echo Point, Kundala Lake, tea plantations and the Tea Museum. If conditions and timings work, you can also include Top Station.

Don't try to cover every attraction in one day. Munnar is best enjoyed slowly, with time for the viewpoints and tea estates.

**Overnight:** Munnar

### Day 3: Munnar → Alleppey Houseboat

Leave Munnar early in the morning. The drive to Alleppey takes around 4–5 hours. Try to reach the houseboat jetty by 12 PM, which is the typical check-in time for an overnight cruise. Kerala Tourism's listed houseboat itineraries include lunch, dinner, breakfast and an overnight stay, with cruising generally continuing until the evening before the boat anchors overnight.

Spend the afternoon cruising through the backwaters, watching paddy fields and village life pass by.

**Overnight:** Houseboat

### Day 4: Alleppey → Kochi

After breakfast and houseboat checkout, drive towards Kochi. Spend the afternoon exploring Fort Kochi, Mattancherry, Jew Town and the Chinese fishing nets, or simply keep the day relaxed.

**Overnight:** Kochi

### Day 5: Kochi Sightseeing & Departure

Depending on your flight or train timing, explore a little more of Kochi before heading to the airport or railway station.

This route works well because you get two nights in Munnar, one night on a houseboat and one night in Kochi without constantly changing hotels.

## Kerala Trip Cost for 5 Days

Here's a realistic mid-range estimate when travelling with 2–4 people:

| Expense | Approx. cost per person |
| --- | --- |
| Munnar hotel – 2 nights | ₹3,000–₹6,000 |
| Kochi hotel – 1 night | ₹1,500–₹3,000 |
| Private cab | ₹5,000–₹8,000 |
| Houseboat | ₹5,000–₹8,000 |
| Food | ₹2,500–₹4,000 |
| Entry fees & activities | ₹1,000–₹2,000 |
| **Estimated total** | **₹18,000–₹31,000** |

These are planning figures rather than fixed package rates. Kerala Tourism's listed 5-day packages can vary substantially depending on accommodation and inclusions.

## Alleppey Houseboat Budget

The houseboat is where you can either keep the trip affordable or significantly increase the cost. Published tariffs show Deluxe overnight houseboats starting around ₹10,000 + GST for a 1-bedroom boat, with larger boats costing more. Meals are generally included.

Keep approximately:

- **Deluxe:** ₹10,000–₹16,000 per boat
- **Premium:** ₹15,000–₹25,000+ per boat
- **Luxury:** ₹20,000–₹35,000+ per boat

Rates can be higher during peak periods, with higher winter rates typically running from October through March.

### How to save on the houseboat

If you're travelling with friends or family, booking a 2- or 3-bedroom houseboat and splitting the cost can bring the per-person price down considerably.

Also check exactly what's included before booking: meals, GST, AC timings, cruise duration, check-in/check-out and route. Kerala Tourism also recommends using the official DTPC houseboat pre-paid counter in Alappuzha for bookings.

## When Should You Visit?

October to March is a popular period for this itinerary, with pleasant sightseeing weather and comfortable conditions in Munnar.

If you enjoy Kerala during the monsoon, June to September can be beautiful too, with lush landscapes and waterfalls. However, expect more rain and occasional changes to outdoor plans.

## FAQs

### Is ₹20,000 enough for a 5-day Kerala trip?

Yes, if you're excluding flights or trains and sharing a cab and houseboat with other travellers. For more comfortable hotels and a better houseboat, ₹25,000–₹30,000 per person is a safer range.

### How much does an Alleppey houseboat cost?

A 1-bedroom Deluxe overnight houseboat can start around ₹10,000 + GST, while Premium and Luxury boats cost more.

### Is one night on a houseboat enough?

Yes. One overnight cruise gives you the classic backwater experience without taking too much time away from Munnar.

### Is Munnar or Alleppey better?

They offer completely different experiences. Munnar is for mountains, tea estates and cool weather; Alleppey is for backwaters and slow travel. For a first Kerala trip, combining both makes more sense.

### Should I book a private cab?

For a 5-day Munnar–Alleppey trip, a private cab is convenient because it covers transfers and allows you to stop at viewpoints and attractions along the way.

### How many days are enough for Munnar and Alleppey?

5 days is ideal for a short trip: two nights in Munnar, one night on the houseboat and one night in Kochi.

## Final Take

For a first Kerala holiday, Munnar and Alleppey give you the best of two worlds — misty hills and tea estates followed by palm-lined backwaters and a traditional houseboat stay.

If you're travelling as a couple or small group, plan around ₹20,000–₹30,000 per person excluding travel to Kerala, and spend a little extra on the houseboat if the backwaters are one of the main reasons you're visiting.`,
    },
]

async function main() {
    const destinations = await prisma.destination.findMany({
        select: { id: true, city: true, name: true },
    })

    for (const post of posts) {
        const match = destinations.find(
            (d) =>
                (d.city || "").trim().toLowerCase() === post.destinationCity.toLowerCase() ||
                (d.name || "").trim().toLowerCase().startsWith(post.destinationCity.toLowerCase())
        )

        const { destinationCity, coverImage, ...rest } = post
        const destinationImage = match
            ? (await prisma.destination.findUnique({
                where: { id: match.id },
                select: { image: true },
            }))?.image
            : null
        const data = { ...rest, coverImage: destinationImage || coverImage }

        const saved = await prisma.blog.upsert({
            where: { slug: post.slug },
            update: {
                ...data,
                destinationId: match?.id ?? null,
                isPublished: true,
            },
            create: {
                ...data,
                destinationId: match?.id ?? null,
                isPublished: true,
                publishedAt: new Date(),
            },
        })

        console.log(
            `${saved.slug}  ->  id ${saved.id}, destination ${match ? `${match.name} (${match.id})` : "none"}`
        )
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
