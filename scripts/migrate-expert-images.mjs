/**
 * Uploads the local travel-expert photographs to Cloudinary and repoints the
 * database at the CDN URLs.
 *
 * Re-runnable: each image uses a fixed public_id and overwrite, so running it
 * again replaces the asset rather than creating duplicates.
 *
 *   node --env-file=.env.local scripts/migrate-expert-images.mjs
 */
import { readdir } from "node:fs/promises"
import path from "node:path"
import { v2 as cloudinary } from "cloudinary"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const LOCAL_DIR = "public/travel-experts"
const CLOUD_FOLDER = "TravPlan/experts"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
    const files = (await readdir(LOCAL_DIR)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    if (files.length === 0) {
        console.log("No local expert images found.")
        return
    }

    for (const file of files) {
        const slug = file.replace(/\.[^.]+$/, "")
        const localPath = `/travel-experts/${file}`

        const uploaded = await cloudinary.uploader.upload(path.join(LOCAL_DIR, file), {
            folder: CLOUD_FOLDER,
            public_id: slug,
            overwrite: true,
            resource_type: "image",
        })

        // Only repoint the rows still using the local path, so re-running this
        // does not clobber an avatar someone changed in the admin since.
        const result = await prisma.tripExpert.updateMany({
            where: { avatar: localPath },
            data: { avatar: uploaded.secure_url },
        })

        console.log(
            `${file.padEnd(34)} -> ${uploaded.secure_url}  (${result.count} row${result.count === 1 ? "" : "s"} updated)`
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
