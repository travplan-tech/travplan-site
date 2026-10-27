/**
 * Applies the per-person rates from the pricing sheet to existing packages.
 *
 * Package.price is a single per-person number, so the "group of 4" per-person
 * figure goes there — that is the lowest per-person rate and what a "from"
 * price means. The couple rate is kept in specialNotes rather than dropped,
 * since it is what a couple actually pays.
 *
 *   node --env-file=.env.local scripts/update-package-prices.mjs [--apply]
 *
 * Without --apply it prints the changes and writes nothing.
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

// Aiven presents a self-signed chain; lib/prisma.ts does the same for dev.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const UPDATES = [
    { id: 7, title: "Kashmir-4N/5D", perPerson: 14999, couple: 35999 },
    { id: 20, title: "Manali-Kasol-3N/4D", perPerson: 12999, couple: 30499 },
]

const OCCUPANCY_NOTE = (perPerson, couple) =>
    `💰 Pricing: ₹${perPerson.toLocaleString("en-IN")} per person on a group of 4. ` +
    `For two travelling together the trip is ₹${couple.toLocaleString("en-IN")} for the couple. ` +
    `Rates vary with group size — tell us how many of you there are and we will confirm the exact figure.`

for (const u of UPDATES) {
    const current = await prisma.package.findUnique({
        where: { id: u.id },
        select: { id: true, title: true, price: true, originalPrice: true, specialNotes: true },
    })
    if (!current) {
        console.error(`  SKIP  id ${u.id} (${u.title}) not found`)
        continue
    }

    const note = OCCUPANCY_NOTE(u.perPerson, u.couple)
    // Replace any previous pricing line rather than stacking a second one.
    const kept = (current.specialNotes || "")
        .split("\n")
        .filter((line) => !line.startsWith("💰 Pricing:") && !line.startsWith("💰 Package Rates:"))
        .join("\n")
        .trim()
    const specialNotes = kept ? `${note}\n${kept}` : note

    const pct = Math.round(((u.perPerson - current.price) / current.price) * 100)
    console.log(
        `  id ${String(u.id).padStart(3)}  ${current.title.padEnd(22)} ` +
        `₹${current.price.toLocaleString("en-IN").padStart(8)} -> ₹${u.perPerson.toLocaleString("en-IN").padStart(8)} ` +
        `(${pct > 0 ? "+" : ""}${pct}%)` +
        (current.originalPrice ? `   clearing originalPrice ₹${current.originalPrice.toLocaleString("en-IN")}` : "")
    )

    if (!APPLY) continue
    await prisma.package.update({
        where: { id: u.id },
        data: {
            price: u.perPerson,
            // A ₹42,000 strike-through against ₹14,999 would advertise a 64%
            // discount that is not being offered. Cleared unless you set one.
            originalPrice: null,
            discountPercent: 0,
            specialNotes,
        },
    })
}

console.log(APPLY ? "\napplied" : "\ndry run — nothing written. Re-run with --apply")

await prisma.$disconnect()
await pool.end()
