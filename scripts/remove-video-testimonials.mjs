/**
 * Takes specific video testimonials off the homepage rail.
 *
 *   node --env-file=.env.local scripts/remove-video-testimonials.mjs [--apply]
 *
 * Clears the video rather than deleting the row. The rail selects on
 * `video IS NOT NULL`, so clearing it is enough to remove the testimonial,
 * and it leaves the 5-star rating attached to its package instead of quietly
 * lowering that package's review count. The URLs are printed first, so
 * putting one back is a single update.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const APPLY = process.argv.includes("--apply")
const IDS = [10, 11]

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const rows = await prisma.review.findMany({ where: { id: { in: IDS } } })

for (const r of rows) {
    console.log(`\n--- id ${r.id} ---`)
    for (const [k, v] of Object.entries(r)) {
        if (v !== null && v !== "" && v !== undefined) console.log(`  ${k}: ${v}`)
    }
}

if (!APPLY) {
    console.log(`\ndry run — ${rows.length} row(s) would be taken off the rail. Re-run with --apply`)
} else {
    const { count } = await prisma.review.updateMany({
        where: { id: { in: IDS } },
        data: { video: null },
    })
    const left = await prisma.review.count({ where: { video: { not: null } } })
    console.log(`\nremoved ${count} from the rail; ${left} video testimonials remain`)
}

await prisma.$disconnect()
await pool.end()
