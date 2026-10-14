/**
 * Seeds the Spiti Valley cost guide.
 *
 * Re-runnable: upserted on its slug, so running it again updates the existing
 * row rather than creating a duplicate.
 *
 *   node --env-file=.env.local scripts/seed-blog-spiti.mjs
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

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const post = {
    slug: "spiti-valley-trip-cost-group-vs-private",
    destinationCity: "Spiti Valley",
    title: "Spiti Valley Trip Cost: Group Tour vs Private Trip Budget Breakdown",
    excerpt:
        "A 7–9 day group tour runs about ₹18,000–₹28,000 per person; a private trip ₹30,000–₹60,000+. Which works out cheaper depends almost entirely on how many of you are sharing the vehicle.",
    metaTitle: "Spiti Valley Trip Cost: Group Tour vs Private Trip | Travplan",
    metaDescription:
        "Spiti Valley trip cost compared: group tour ₹18,000–₹28,000 per person vs private trip ₹30,000–₹60,000+. Full budget breakdown, best time to visit and permits.",
    tags: "Spiti Valley, Himachal, Trip Cost, Budget, Group Tours, Road Trip",
    readingMinutes: 8,
    content: `Spiti Valley is one of those destinations where the journey is as memorable as the place itself — dramatic mountain roads, ancient monasteries, remote villages and star-filled skies. Before planning, though, there is one question worth settling: is a group tour actually cheaper than a private Spiti road trip?

For most travellers a 7–9 day group tour costs roughly **₹18,000–₹28,000 per person**, while a private trip runs **₹30,000–₹60,000+ per person**, depending on group size and comfort level. Transport, and how many people share the vehicle, make the biggest difference to the final number.

## Group tour vs private trip, at a glance

| | Group tour | Private trip |
| --- | --- | --- |
| Approx. cost per person | ₹18,000 – ₹28,000 | ₹30,000 – ₹60,000+ |
| Duration | Usually 7–9 days | Flexible |
| Transport | Shared SUV or tempo traveller | Private SUV or car |
| Accommodation | Standard stays, shared rooms | Your choice of stays |
| Itinerary | Fixed | Customisable |
| Travel companions | Other travellers | Friends or family |
| Best for | Solo and budget-conscious travellers | Couples, families, friend groups |
| Flexibility | Limited | High |

Estimates are indicative for a 7–9 day trip starting from Delhi or a nearby departure point. Flights, personal shopping and optional activities cost extra.

## Option 1: the group tour budget

A group tour is usually more economical because transport, driver charges and trip logistics are shared across several travellers.

| Expense | Approx. cost per person |
| --- | --- |
| Group tour package | ₹15,000 – ₹23,000 |
| Meals not included in the package | ₹1,500 – ₹3,000 |
| Personal expenses | ₹1,000 – ₹2,000 |
| Optional activities and extras | ₹1,000 – ₹2,000 |
| **Estimated total** | **₹18,500 – ₹30,000** |

Most organised tours include accommodation, road transport, breakfasts, dinners and a trip leader. Inclusions differ, so check whether the package covers Delhi transfers, Chandratal camping and any additional transport charges.

### Who should choose a group tour

It makes sense if you are travelling solo, want to meet other travellers, or would rather not manage mountain-road logistics yourself.

- **Biggest advantage:** a planned itinerary without arranging every transfer and stay yourself.
- **Biggest drawback:** less freedom to change stops, extend sightseeing or linger in a village.

## Option 2: the private trip budget

A private trip gives you control over the itinerary, pace, accommodation and stops. The dedicated vehicle is the major expense.

| Expense | Approx. total for 2 |
| --- | --- |
| Private vehicle and driver | ₹30,000 – ₹50,000 |
| Accommodation | ₹12,000 – ₹22,000 |
| Food | ₹6,000 – ₹10,000 |
| Activities and miscellaneous | ₹3,000 – ₹6,000 |
| **Estimated total for 2** | **₹51,000 – ₹88,000** |
| **Approx. per person** | **₹25,500 – ₹44,000** |

These assume standard guesthouses or homestays. Premium accommodation, a larger vehicle, extra travel days or a costlier departure arrangement push the total higher.

### Who should choose a private trip

Best for couples, families and groups of friends who want a personalised itinerary. You can take photo stops, explore villages at your own pace and spend extra time where you like — subject to road conditions and safety.

- **Biggest advantage:** flexibility and privacy.
- **Biggest drawback:** the vehicle cost makes it expensive for just one or two people.

## Which is cheaper for couples and groups?

It comes down to how many of you are travelling.

| Travellers | Better option | Why |
| --- | --- | --- |
| Solo traveller | Group tour | Shared transport keeps costs down |
| Couple | Compare both | Private becomes attractive once costs are shared |
| 3–4 friends | Private may offer value | Vehicle cost splits further |
| Family with children | Private trip | More flexibility over stops and rest breaks |
| Budget-conscious | Group tour | Easier to plan a fixed overall budget |

**Money-saving tip:** if four of you are travelling, compare the complete private-trip quote against four group-tour packages. Do not compare only the advertised package price — include meals, transport to the starting point and anything excluded.

## Best time to visit Spiti Valley

The right window depends on the route and the experience you want.

- **May–June:** conditions improve as summer approaches, though high passes may still be closed.
- **July–August:** the main summer circuit is generally more accessible, but road conditions change.
- **September–early October:** clear views and cooler weather, with cold nights.
- **Winter:** for travellers specifically after snow and winter landscapes, with serious cold and road-access limits.

The **Shimla–Kinnaur** route is generally the more reliable approach across most of the year. The **Manali–Kaza** route over Kunzum Pass is seasonal and usually closes in winter. Always check official road updates before travelling.

## FAQs

### How much does a Spiti Valley trip cost per person?

For 7–9 days, budget roughly ₹18,000–₹28,000 for a group tour and ₹30,000–₹60,000+ for a private trip, depending on inclusions and group size.

### Is a private Spiti trip worth the extra money?

Yes, if flexibility, privacy and travelling at your own pace matter to you. For solo travellers a group tour is usually more economical.

### Can I do Spiti Valley on a low budget?

Yes. Public transport, basic homestays and local buses bring costs down, but you will need more time and flexibility. Some remote attractions are hard to reach without arranging additional transport.

### How many days are enough for Spiti Valley?

Around 7–9 days suits a typical road trip. A longer itinerary leaves more room for acclimatisation and unexpected road delays.

### Do Indian travellers need a permit for Spiti?

Indian citizens generally do not need an Inner Line Permit for the standard Spiti tourist circuit. Vehicle-specific e-passes may apply on certain routes or at certain attractions, so check official requirements before departure.

## Final verdict

Travelling solo, or want predictable costs? A group tour is usually the better choice — shared transport, a planned itinerary, and none of the arranging.

Travelling as a couple, family or group of friends? A private trip offers more flexibility, and splitting the vehicle cost makes it far more reasonable.

Whichever you choose, do not plan Spiti around the cheapest package alone. Allow time for acclimatisation, keep a buffer for road delays, and confirm exactly what is included before paying.`,
}

async function main() {
    const destinations = await prisma.destination.findMany({
        select: { id: true, city: true, name: true, image: true },
    })

    const match = destinations.find(
        (d) =>
            (d.city || "").trim().toLowerCase() === post.destinationCity.toLowerCase() ||
            (d.name || "").trim().toLowerCase().startsWith(post.destinationCity.toLowerCase())
    )

    const { destinationCity, ...rest } = post
    const data = { ...rest, coverImage: match?.image ?? null }

    const saved = await prisma.blog.upsert({
        where: { slug: post.slug },
        update: { ...data, destinationId: match?.id ?? null, isPublished: true },
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
    console.log(`cover: ${saved.coverImage || "(none — set one in the admin)"}`)
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect(); await pool.end() })
