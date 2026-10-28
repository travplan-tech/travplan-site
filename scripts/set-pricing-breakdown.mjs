/**
 * Writes the full price breakdown into each package's special notes.
 *
 *   node --env-file=.env.local scripts/set-pricing-breakdown.mjs [--apply]
 *
 * Package.price is a single number and the site labels it "per person", so a
 * group-of-4 rate sitting there reads as the price for one traveller. These
 * notes say what each figure is actually for — solo, couple, and group of
 * four — so nobody arrives at checkout expecting ₹14,999 and finds the rate
 * only holds at four people.
 *
 * The couple per-person figure is the couple total halved; where that lands
 * on a half-rupee it is rounded up, so the quoted per-person figures never
 * sum to less than the couple total.
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

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`

const PRICING = [
    { id: 50, couple: 27000, groupOf4: 11500 },
    { id: 51, couple: 35999, groupOf4: 14999 },
    { id: 52, couple: 30499, groupOf4: 12999 },
]

function breakdown({ couple, groupOf4 }) {
    const couplePerPerson = Math.ceil(couple / 2)
    return (
        `💰 Price Breakdown (per person, unless stated):\n` +
        `• Group of 4 — ${inr(groupOf4)} per person. This is the headline rate shown above.\n` +
        `• Couple (2 travelling) — ${inr(couple)} for the two of you, ${inr(couplePerPerson)} per person.\n` +
        `• Solo or 3 travelling — shared vehicle and room costs change the per-person rate, ` +
        `so tell us your group size and we will confirm the exact figure before you book.\n` +
        `• Children, extra beds and room upgrades are quoted on request.`
    )
}

for (const p of PRICING) {
    const current = await prisma.package.findUnique({
        where: { id: p.id },
        select: { id: true, title: true, price: true, specialNotes: true },
    })
    if (!current) {
        console.error(`  SKIP  id ${p.id} not found`)
        continue
    }

    const block = breakdown(p)
    // Replace any pricing block already written rather than stacking another.
    const kept = (current.specialNotes || "")
        .split("\n")
        .filter((l) => !l.startsWith("💰 Price") && !l.startsWith("💰 Pricing:") && !l.startsWith("• "))
        .join("\n")
        .trim()

    const specialNotes = kept ? `${block}\n${kept}` : block

    console.log(`  id ${p.id}  ${current.title.slice(0, 40)}`)
    console.log(block.split("\n").map((l) => `      ${l}`).join("\n"))

    if (APPLY) await prisma.package.update({ where: { id: p.id }, data: { specialNotes } })
}

console.log(APPLY ? "\napplied" : "\ndry run — nothing written. Re-run with --apply")

await prisma.$disconnect()
await pool.end()
