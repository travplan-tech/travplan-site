/**
 * Places images inside each post's body.
 *
 *   node --env-file=.env.local scripts/add-blog-images.mjs [--apply]
 *
 * Posts had a cover image and then several thousand words of unbroken text.
 * Each image goes directly after a named heading, so it illustrates the
 * section it belongs to rather than being decoration dropped at intervals.
 *
 * Re-runnable: every existing markdown image is stripped before the new ones
 * are placed, so running twice does not stack duplicates.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const APPLY = process.argv.includes("--apply")

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// Delivered through f_auto,q_auto so a 5MB master never reaches a reader.
const img = (name) =>
    `https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1200,c_limit/TravPlan/stock/${name}.jpg`

/** slug -> [{ afterHeading, image, alt }] */
const PLACEMENTS = {
    "best-time-to-visit-meghalaya": [
        { after: "June to September: Go for the Waterfalls", image: "meghalaya-nohkalikai-falls",
          alt: "A waterfall dropping into a green gorge in Meghalaya during the monsoon" },
        { after: "October to November: The Sweet Spot", image: "meghalaya-living-root-bridge",
          alt: "A living root bridge grown from fig roots across a stream in Meghalaya" },
        { after: "What Should You See in Each Season?", image: "meghalaya-waterfall-scale",
          alt: "Visitors at the base of a Meghalaya waterfall, showing its scale" },
    ],
    "guwahati-to-tawang-itinerary": [
        { after: "Guwahati to Tawang Route", image: "tawang-prayer-flags-sunrise",
          alt: "Prayer flags above the eastern Himalaya at sunrise on the road to Tawang" },
        { after: "7-Day Tawang Itinerary", image: "tawang-monastery-monk",
          alt: "A monk walking past the painted facade of a monastery in Tawang" },
        { after: "Best Time for a Tawang Trip", image: "tawang-sunset-range",
          alt: "Sunset over the ridges of the Kameng valley in Arunachal Pradesh" },
    ],
    "kerala-trip-cost-5-days": [
        { after: "5-Day Munnar–Alleppey Itinerary", image: "kerala-tea-hills",
          alt: "Tea estates rolling down the hills around Munnar in Kerala" },
        { after: "Alleppey Houseboat Budget", image: "kerala-houseboat-backwaters",
          alt: "A traditional houseboat moored on the Alleppey backwaters" },
        { after: "When Should You Visit?", image: "kerala-lake-periyar",
          alt: "A lake ringed by forest in the Kerala hills" },
    ],
    "shillong-cherry-blossom-festival-2026": [
        { after: "Where to stay in Shillong", image: "meghalaya-waterfall-aerial",
          alt: "An aerial view of a waterfall in the hills around Shillong" },
        { after: "Meghalaya itinerary: 5 days around the festival", image: "meghalaya-living-root-bridge",
          alt: "A living root bridge in the forests below Cherrapunji" },
        { after: "What to pack for November", image: "meghalaya-nohkalikai-falls",
          alt: "A Meghalaya waterfall under clear November skies" },
    ],
    "spiti-valley-trip-cost-group-vs-private": [
        { after: "Option 1: the group tour budget", image: "spiti-key-monastery-snow",
          alt: "Key Monastery stacked up its hillside under snow-covered peaks in Spiti" },
        { after: "Option 2: the private trip budget", image: "spiti-key-golden-hour",
          alt: "Key Monastery above the Spiti river at golden hour" },
        { after: "Best time to visit Spiti Valley", image: "spiti-monastery-range",
          alt: "A monastery below the snow-covered range of the Spiti valley" },
    ],
}

let changed = 0

for (const [slug, placements] of Object.entries(PLACEMENTS)) {
    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true, slug: true, content: true } })
    if (!blog) {
        console.error(`  SKIP  ${slug} not found`)
        continue
    }

    // Strip any previously inserted image so this is idempotent.
    let content = blog.content.replace(/^!\[[^\]]*\]\([^)]*\)\n\n?/gm, "")

    let placed = 0
    for (const p of placements) {
        const heading = `## ${p.after}`
        const at = content.indexOf(heading)
        if (at === -1) {
            console.error(`  !  ${slug}: heading not found — "${p.after}"`)
            continue
        }
        const lineEnd = content.indexOf("\n", at)
        const markdown = `\n\n![${p.alt}](${img(p.image)})`
        content = content.slice(0, lineEnd) + markdown + content.slice(lineEnd)
        placed++
    }

    console.log(`  ${slug.padEnd(42)} ${placed} image${placed === 1 ? "" : "s"}`)
    if (APPLY && placed) {
        await prisma.blog.update({ where: { id: blog.id }, data: { content } })
        changed++
    }
}

console.log(APPLY ? `\nupdated ${changed} posts` : "\ndry run — nothing written. Re-run with --apply")

await prisma.$disconnect()
await pool.end()
