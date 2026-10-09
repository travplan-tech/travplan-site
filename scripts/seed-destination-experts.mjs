/**
 * Seeds the named destination experts whose photographs live in
 * public/travel-experts. Re-runnable: each person is matched on name and
 * updated rather than duplicated.
 *
 *   node --env-file=.env.local scripts/seed-destination-experts.mjs
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const EXPERTS = [
    {
        name: "Akansha Aggarwal",
        place: "Tawang",
        avatar: "/travel-experts/akansha-aggarwal-tawang.png",
        order: 1,
    },
    {
        name: "Isha",
        place: "Meghalaya",
        avatar: "/travel-experts/isha-meghalaya.png",
        order: 2,
    },
    {
        name: "Tilitma",
        place: "Kerala",
        avatar: "/travel-experts/tilitma-kerala.png",
        order: 3,
    },
    {
        name: "Vandana",
        place: "Kerala",
        avatar: "/travel-experts/vandana-kerala.png",
        order: 4,
    },
]

async function main() {
    const destinations = await prisma.destination.findMany({
        select: { id: true, name: true, city: true },
    })

    for (const expert of EXPERTS) {
        const key = expert.place.toLowerCase()
        const match = destinations.find(
            (d) =>
                (d.city || "").trim().toLowerCase() === key ||
                (d.name || "").trim().toLowerCase().startsWith(key)
        )

        const data = {
            avatar: expert.avatar,
            bio: `Destination expert for ${expert.place}. Plans routes, stays and timings here every season.`,
            expertise: expert.place,
            type: "DOMESTIC",
            isActive: true,
            order: expert.order,
            destinationId: match?.id ?? null,
        }

        const existing = await prisma.tripExpert.findFirst({ where: { name: expert.name } })
        const saved = existing
            ? await prisma.tripExpert.update({ where: { id: existing.id }, data })
            : await prisma.tripExpert.create({ data: { name: expert.name, ...data } })

        console.log(
            `${saved.name.padEnd(18)} -> ${expert.place.padEnd(10)} ${match ? `(destination ${match.id})` : "(no destination matched)"}`
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
