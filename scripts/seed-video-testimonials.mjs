/**
 * Adds the traveller video testimonials shown in "Travellers in their own
 * words" on the homepage.
 *
 * Re-runnable: each row is matched on its video URL, so running this again
 * updates rather than duplicating.
 *
 * Note on packageId: Review.packageId is required, so each video has to hang
 * off a package. These are attached to the one the existing video
 * testimonials already use. They are 5-star like the others, so the package's
 * average does not move — only its review count. Reassign them in the admin
 * if a video belongs to a different trip.
 *
 *   node --env-file=.env.local scripts/seed-video-testimonials.mjs
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// userName and destination are deliberately left empty rather than invented —
// the card falls back to "Traveler" and hides an empty destination. Fill them
// in from the admin once the real names are known.
const VIDEOS = [
    "https://res.cloudinary.com/dcolmsvtp/video/upload/v1791957076/IMG_6908_u8rlxb.mp4",
    "https://res.cloudinary.com/dcolmsvtp/video/upload/v1791957076/IMG_3199_qt3eyy.mp4",
    "https://res.cloudinary.com/dcolmsvtp/video/upload/v1791957073/IMG_2102_l3n45u.mov",
    "https://res.cloudinary.com/dcolmsvtp/video/upload/v1791957072/IMG_3170_fwod1d.mp4",
    "https://res.cloudinary.com/dcolmsvtp/video/upload/v1791957098/IMG_3195_ot1spo.mp4",
]

async function main() {
    // Hang them off whichever package the existing video testimonials use, so
    // they stay together; fall back to any package if there are none yet.
    const existing = await prisma.review.findFirst({
        where: { video: { not: null } },
        select: { packageId: true },
        orderBy: { createdAt: "desc" },
    })
    const anyPackage = await prisma.package.findFirst({ select: { id: true } })
    const packageId = existing?.packageId ?? anyPackage?.id

    if (!packageId) {
        console.error("No packages exist, so a review cannot be attached to one.")
        process.exit(1)
    }

    for (const video of VIDEOS) {
        const already = await prisma.review.findFirst({ where: { video }, select: { id: true } })
        if (already) {
            console.log(`  exists  #${already.id}  ${video.split("/").pop()}`)
            continue
        }
        const created = await prisma.review.create({
            data: { packageId, rating: 5, video, destination: "", userName: null },
            select: { id: true },
        })
        console.log(`  added   #${created.id}  ${video.split("/").pop()}`)
    }

    const total = await prisma.review.count({ where: { video: { not: null } } })
    console.log(`\n${total} video testimonials now live (attached to package ${packageId})`)
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect(); await pool.end() })
