/**
 * Seeds the Shillong Cherry Blossom Festival guide.
 *
 * Re-runnable: upserted on its slug, so running it again updates the existing
 * row rather than creating a duplicate.
 *
 *   node --env-file=.env.local scripts/seed-blog-shillong.mjs
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
    slug: "shillong-cherry-blossom-festival-2026",
    destinationCity: "Meghalaya",
    title:
        "Shillong Cherry Blossom Festival 2026: Trip Budget, Where to Stay & Meghalaya Itinerary",
    excerpt:
        "The 2026 festival runs 20–21 November in New Shillong. Here is a five-day Meghalaya itinerary around it, where to stay, and what the trip actually costs per person.",
    metaTitle: "Shillong Cherry Blossom Festival 2026: Budget & Itinerary | Travplan",
    metaDescription:
        "Plan the Shillong Cherry Blossom Festival 2026 (20–21 November): a 5-day Meghalaya itinerary, where to stay, a per-person budget of ₹18,000–₹32,000 and what to pack.",
    tags: "Meghalaya, Shillong, Cherry Blossom Festival, Festivals, North East India, Itinerary",
    readingMinutes: 7,
    content: `Imagine Shillong's streets dotted with pink cherry blossoms, cool mountain air, live music and two evenings of international performances. That is what makes the cherry blossom festival Meghalaya hosts each year more than just a music event — it is an opportunity to explore the state during one of its most beautiful seasons.

The 2026 festival is scheduled for **20–21 November**, with international artists including Khalid, Swae Lee and Boys Like Girls announced on the lineup.

If you are planning to attend, whether you choose a curated Meghalaya tour package or travel independently, here is how to organise your trip, where to stay and how much to budget.

## Shillong Cherry Blossom Festival 2026: key details

- **Dates:** 20–21 November 2026
- **Location:** New Shillong, Meghalaya
- **Event timings:** From 2 PM onwards, according to Meghalaya Tourism
- **International artists announced:** Khalid, Swae Lee and Boys Like Girls
- **Best trip duration:** 4–6 days

Check the official festival website for the latest lineup, ticket categories and venue information before travelling. A comprehensive Shillong tour package can also help secure hotel bookings and festival transfers in advance.

> **Worth knowing before you book:** the concert venue is separate from Shillong's popular cherry-blossom viewing spots. Blossoms also depend on the weather, so peak bloom is not guaranteed on the festival dates.

## Where to stay in Shillong

Your accommodation choice makes a real difference, especially when thousands of visitors arrive for the festival.

### 1. Police Bazaar — best for first-time visitors

Stay here for easy access to restaurants, shopping, taxis and the popular places to visit in Shillong. It is a convenient base for exploring the city between festival events.

### 2. Laitumkhrah — best for cafés and a relaxed vibe

This area is known for cafés, casual dining and a lively local atmosphere. A good option for couples and groups of friends.

### 3. New Shillong — best for festival access

Consider staying closer to New Shillong to cut travel time to the concert venue. Confirm the exact venue and transport arrangements before booking.

**Booking tip:** reserve early. Festival weekends push accommodation prices up and last-minute availability is limited. Meghalaya Tourism also advises booking ahead during the busy winter travel season.

## Meghalaya itinerary: 5 days around the festival

A balanced itinerary lets you enjoy the music without missing the state's natural beauty.

### Day 1: Arrive in Guwahati → Shillong

Fly into Guwahati and travel to Shillong by road. After checking in, explore Police Bazaar, try the local food and spend the evening at a café.
*Overnight: Shillong*

### Day 2: Shillong sightseeing and cherry blossoms

Visit Ward's Lake, Shillong Golf Course and other spots where the cherry trees may be flowering. Stop at Shillong Peak if the weather and visibility allow. Keep time free for the city's cafés and local markets.
*Overnight: Shillong*

### Day 3: Cherry Blossom Festival

Spend the day at the festival — performances, food stalls, music and cultural experiences. Arrange your return transport in advance rather than waiting until the concert ends.
*Overnight: Shillong*

### Day 4: Cherrapunji (Sohra)

Head to Sohra, also known as Cherrapunji, for some of the most famous places to visit in Meghalaya. Depending on weather and opening conditions, see Nohkalikai Falls, Seven Sisters Falls and the nearby viewpoints.
*Overnight: Shillong or Sohra*

### Day 5: Shillong → Guwahati

Breakfast, then the drive back to Guwahati. If your flight is early, travel back the previous evening rather than rushing the departure.

**Planning tip:** if attending both festival days matters most, extend the trip to six days and keep the return journey flexible.

## What the trip costs

An approximate budget for one person on a 5-day trip from Guwahati, assuming shared accommodation and transport.

| Expense | Estimated cost per person |
| --- | --- |
| Return flights to Guwahati | ₹5,000 – ₹10,000 |
| Accommodation for 4 nights | ₹5,000 – ₹9,000 |
| Shared road transport | ₹2,000 – ₹4,000 |
| Food and cafés | ₹2,000 – ₹3,500 |
| Festival tickets | ₹2,500 onwards, depending on the ticket |
| Local sightseeing | ₹1,500 – ₹3,000 |
| **Estimated total** | **₹18,000 – ₹32,000** |

These are planning estimates, not fixed prices. Flights, accommodation and festival tickets cost more on peak dates — check the festival's official ticketing platform for current prices and availability. Travelling with friends and sharing a cab brings the per-person cost down.

## What to pack for November

Shillong gets chilly in November, particularly after sunset. Carry:

- A warm jacket and comfortable layers
- Walking shoes suitable for outdoor venues
- A compact umbrella or light rain jacket
- A power bank and photo ID
- Any essential medication

Keep your festival ticket accessible and check the event's entry and baggage rules before leaving your hotel.

## FAQs

### When is the Shillong Cherry Blossom Festival 2026?

The festival is scheduled for 20–21 November 2026.

### How much does a Shillong festival trip cost?

Budget roughly ₹18,000–₹32,000 per person for five days, covering estimated flights from within India, accommodation, transport, food, sightseeing and a festival ticket.

### Where can I see cherry blossoms in Shillong?

Try Ward's Lake, Shillong Golf Course and other spots around the city. Bloom timing depends on the weather, so the flowers may not be at their peak during the festival.

### Is three days enough for Shillong?

Three days works for Shillong and the festival itself, but five days gives you time to explore Sohra and see Meghalaya beyond the concerts.

### Should I book hotels in advance?

Yes. November is a popular travel period and the festival increases demand for both accommodation and transport.

## Final take

The Shillong Cherry Blossom Festival is a great reason to visit Meghalaya, but do not make the concerts your entire trip.

Plan for two festival days, some time to explore Shillong and at least one excursion into Meghalaya's landscapes. Book your stay early, confirm the concert venue and transport arrangements, and leave room in the itinerary for the cherry blossoms themselves.

That way you get both sides of the trip: the energy of a major music festival, and the quieter beauty of Meghalaya.`,
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
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
