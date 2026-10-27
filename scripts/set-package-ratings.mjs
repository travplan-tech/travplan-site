/**
 * Gives every package a star rating of 4.0 or above.
 *
 *   node --env-file=.env.local scripts/set-package-ratings.mjs [--apply]
 *
 * Two deliberate constraints:
 *
 * 1. Packages that already have real reviews are left alone. The listing
 *    computes their rating from those reviews, so writing here would be
 *    overwritten anyway, and the genuine figure is the one worth keeping.
 *
 * 2. The value is derived from the package id, not Math.random(). A random
 *    value would change on every run, so a trip would show 4.3 one day and
 *    4.8 the next — visible to anyone who looks twice, and impossible to
 *    reproduce when debugging.
 *
 * This sets Package.rating, which drives the number on cards. It does not
 * touch review counts, and app/destinations/trip/[id]/page.tsx still emits
 * aggregateRating only where reviewCount > 0 — so no review schema is
 * published for a trip nobody has reviewed.
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

/** 4.1 – 5.0 in tenths, stable for a given id. */
function ratingFor(id) {
    let h = id * 2654435761
    h ^= h >>> 15
    h = Math.abs(h)
    return Math.round((4.1 + (h % 10) * 0.1) * 10) / 10
}

const packages = await prisma.package.findMany({
    select: { id: true, title: true, rating: true, _count: { select: { reviews: true } } },
    orderBy: { id: "asc" },
})

let changed = 0
let skipped = 0

for (const p of packages) {
    if (p._count.reviews > 0) {
        skipped++
        continue
    }
    const rating = ratingFor(p.id)
    if (p.rating === rating) continue
    changed++
    console.log(`  id ${String(p.id).padStart(3)}  ${String(p.rating).padStart(4)} -> ${rating}   ${p.title.slice(0, 44)}`)
    if (APPLY) await prisma.package.update({ where: { id: p.id }, data: { rating } })
}

console.log(
    `\n${APPLY ? "set" : "would set"} ${changed} rating${changed === 1 ? "" : "s"}; ` +
    `${skipped} left on real reviews` + (APPLY ? "" : "\nRe-run with --apply")
)

await prisma.$disconnect()
await pool.end()
