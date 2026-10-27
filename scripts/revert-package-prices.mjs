/**
 * Puts Kashmir-4N/5D and Manali-Kasol-3N/4D back to the prices they had before
 * scripts/update-package-prices.mjs ran on 2026-10-27.
 *
 * The values below are the ones read out of the database immediately before
 * that change, not reconstructed.
 *
 *   node --env-file=.env.local scripts/revert-package-prices.mjs [--apply]
 *
 * specialNotes is cleared rather than restored: before the change both rows
 * held nothing except a pricing line, which is what the update replaced.
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

const ORIGINALS = [
    { id: 7, title: "Kashmir-4N/5D", price: 34999, originalPrice: 42000 },
    { id: 20, title: "Manali-Kasol-3N/4D", price: 7499, originalPrice: null },
]

for (const o of ORIGINALS) {
    const current = await prisma.package.findUnique({
        where: { id: o.id },
        select: { id: true, title: true, price: true, originalPrice: true },
    })
    if (!current) {
        console.error(`  SKIP  id ${o.id} (${o.title}) not found`)
        continue
    }

    console.log(
        `  id ${String(o.id).padStart(3)}  ${current.title.padEnd(22)} ` +
        `₹${current.price.toLocaleString("en-IN").padStart(8)} -> ₹${o.price.toLocaleString("en-IN").padStart(8)}` +
        `   originalPrice ${current.originalPrice ?? "none"} -> ${o.originalPrice ?? "none"}`
    )

    if (!APPLY) continue
    await prisma.package.update({
        where: { id: o.id },
        data: {
            price: o.price,
            originalPrice: o.originalPrice,
            specialNotes: null,
        },
    })
}

console.log(APPLY ? "\nreverted" : "\ndry run — nothing written. Re-run with --apply")

await prisma.$disconnect()
await pool.end()
