/**
 * Uploads a package's images to Cloudinary as untouched masters and prints the
 * URLs to paste into a seed script.
 *
 * Masters go up at full resolution with no transformation, so Cloudinary keeps
 * the highest quality original. Delivery happens through f_auto,q_auto,w_N
 * transforms applied at render time (lib/media-folders.ts), which is what keeps
 * a 7.8MB master from ever reaching a browser.
 *
 *   node --env-file=.env.local scripts/upload-package-media.mjs <folder> <slug>
 *
 * The first file whose name starts with "cover" (or, failing that, the
 * alphabetically first) becomes the hero; the rest become the gallery.
 */
import { readdir, stat } from "node:fs/promises"
import { basename, extname, join } from "node:path"
import { v2 as cloudinary } from "cloudinary"

const [folder, slug] = process.argv.slice(2)
if (!folder || !slug) {
    console.error("usage: node --env-file=.env.local scripts/upload-package-media.mjs <folder> <slug>")
    process.exit(1)
}

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic"])
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm"])

const entries = (await readdir(folder))
    .filter((f) => !f.startsWith("."))
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()) || VIDEO_EXT.has(extname(f).toLowerCase()))
    .sort()

if (!entries.length) {
    console.error(`no images or videos found in ${folder}`)
    process.exit(1)
}

// A file named cover.* is the hero; otherwise the first one alphabetically.
const coverIdx = Math.max(0, entries.findIndex((f) => basename(f, extname(f)).toLowerCase().startsWith("cover")))
const ordered = [entries[coverIdx], ...entries.filter((_, i) => i !== coverIdx)]

const uploaded = []
for (const [i, file] of ordered.entries()) {
    const path = join(folder, file)
    const ext = extname(file).toLowerCase()
    const isVideo = VIDEO_EXT.has(ext)
    // Keep the source stem so an asset stays traceable to the file it came from,
    // and so a re-run overwrites rather than duplicating.
    const stem = basename(file, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const publicId = `TravPlan/packages/${slug}/${i === 0 ? "cover" : stem || `image-${i}`}`
    try {
        const result = await cloudinary.uploader.upload(path, {
            public_id: publicId,
            overwrite: true,
            resource_type: isVideo ? "video" : "image",
        })
        const kb = Math.round((await stat(path)).size / 1024)
        uploaded.push({ url: result.secure_url, w: result.width, h: result.height, hero: i === 0 })
        console.log(`  ok   ${file.padEnd(40)} ${result.width}x${result.height} ${kb}KB -> ${result.public_id}`)
    } catch (e) {
        console.error(`  FAIL ${file} :: ${e.message || e}`)
    }
}

const hero = uploaded.find((u) => u.hero)
const gallery = uploaded.filter((u) => !u.hero)

console.log(`\nuploaded ${uploaded.length} of ${ordered.length}\n`)
console.log(`const IMAGE = "${hero?.url ?? ""}"\n`)
console.log(`const GALLERY = [\n${gallery.map((g) => `    "${g.url}",`).join("\n")}\n].join(",")`)
