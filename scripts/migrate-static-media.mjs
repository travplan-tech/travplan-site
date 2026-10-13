/**
 * Moves the last of the hardcoded media onto Cloudinary and rewrites the
 * source files to point at the CDN.
 *
 * Two sources are handled:
 *   1. photographs sitting in public/ and referenced from code
 *   2. hotlinked images.unsplash.com URLs
 *
 * Browser chrome (favicons, PWA icons, logos) deliberately stays local: it is
 * tiny, it is requested on every page, and the PWA manifest expects it to be
 * same-origin.
 *
 * Re-runnable: every asset uses a deterministic public_id with overwrite, so a
 * second run replaces the asset instead of creating duplicates, and the source
 * rewrite is a no-op once the URLs are already in place.
 *
 *   node --env-file=.env.local scripts/migrate-static-media.mjs
 *   node --env-file=.env.local scripts/migrate-static-media.mjs --dry-run
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises"
import path from "node:path"
import { v2 as cloudinary } from "cloudinary"

const DRY_RUN = process.argv.includes("--dry-run")
const SOURCE_DIRS = ["app", "components", "lib"]
const LOCAL_FOLDER = "TravPlan/site"
const STOCK_FOLDER = "TravPlan/stock"

/** Stays on the origin — see the note above. */
const KEEP_LOCAL = /^\/(favicon|icon-|apple-touch-icon|logo|placeholder|manifest)/

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/** Every file under a directory, recursively. */
async function walk(dir) {
    const out = []
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) out.push(...(await walk(full)))
        else out.push(full)
    }
    return out
}

const sourceFiles = (
    await Promise.all(SOURCE_DIRS.map((d) => walk(d)))
).flat().filter((f) => /\.(tsx?|mjs)$/.test(f))

const sources = new Map()
for (const f of sourceFiles) sources.set(f, await readFile(f, "utf8"))
const allCode = [...sources.values()].join("\n")

// ---------------------------------------------------------------- local files

const publicFiles = (await walk("public")).filter((f) =>
    /\.(png|jpe?g|webp|avif|mp4|mov|webm|gif)$/i.test(f)
)

const localJobs = []
// Two files can share a stem (domestic.jpg vs domestic.jpeg), which would
// collide on one public_id, so those keep their extension in the slug.
const stems = new Map()
for (const file of publicFiles) {
    const stem = path.basename(file).replace(/\.[^.]+$/, "").toLowerCase()
    stems.set(stem, (stems.get(stem) || 0) + 1)
}

for (const file of publicFiles) {
    const webPath = "/" + path.relative("public", file).split(path.sep).join("/")
    if (KEEP_LOCAL.test(webPath)) continue
    // Already handled by migrate-expert-images.mjs.
    if (webPath.startsWith("/travel-experts/")) continue

    const stem = path.basename(file).replace(/\.[^.]+$/, "").toLowerCase()
    const bare = webPath.replace(/^\//, "")
    const slug = (stems.get(stem) > 1 ? bare.replace(/\.([^.]+)$/, "-$1") : bare.replace(/\.[^.]+$/, ""))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

    localJobs.push({
        kind: "local",
        from: webPath,
        file,
        publicId: `${LOCAL_FOLDER}/${slug}`,
        isVideo: /\.(mp4|mov|webm)$/i.test(file),
        referenced: allCode.includes(`"${webPath}"`),
    })
}

// ------------------------------------------------------------- unsplash files

const stockUrls = [
    ...new Set(allCode.match(/https:\/\/images\.unsplash\.com\/[^"'` )]+/g) || []),
]

const stockJobs = stockUrls.map((url) => {
    const id = url.match(/photo-([0-9a-f-]+)/i)?.[1] || url.slice(-12)
    return {
        kind: "stock",
        from: url,
        // Fetch the original rather than the resized variant the code asked
        // for, so Cloudinary holds a master it can downscale from.
        file: url.split("?")[0],
        publicId: `${STOCK_FOLDER}/unsplash-${id}`,
        isVideo: false,
        referenced: true,
    }
})

// ------------------------------------------------------------------ do the work

const jobs = [...localJobs, ...stockJobs]
console.log(
    `${jobs.length} assets to migrate (${localJobs.length} local, ${stockJobs.length} stock)` +
    (DRY_RUN ? "  [DRY RUN]" : "")
)

const mapping = new Map()
let failed = 0

for (const job of jobs) {
    const label = job.from.length > 62 ? job.from.slice(0, 59) + "..." : job.from
    if (DRY_RUN) {
        console.log(`  would upload ${label.padEnd(64)} -> ${job.publicId}`)
        continue
    }
    try {
        const result = await cloudinary.uploader.upload(job.file, {
            public_id: job.publicId,
            overwrite: true,
            resource_type: job.isVideo ? "video" : "image",
        })
        mapping.set(job.from, result.secure_url)
        const size = job.kind === "local" ? `${Math.round((await stat(job.file)).size / 1024)}KB` : ""
        console.log(`  ok   ${label.padEnd(64)} -> ${result.public_id} ${size}`)
    } catch (e) {
        failed++
        console.error(`  FAIL ${label} :: ${e.message || e}`)
    }
}

if (DRY_RUN) process.exit(0)

// ------------------------------------------------------- rewrite the source

let filesChanged = 0
let replacements = 0

for (const [file, original] of sources) {
    let updated = original
    for (const [from, to] of mapping) {
        // Local paths are matched inside quotes so that "/domestic.jpg" never
        // matches a longer path that merely ends the same way.
        const needles = from.startsWith("/") ? [`"${from}"`, `'${from}'`] : [from]
        for (const needle of needles) {
            if (!updated.includes(needle)) continue
            const replacement = from.startsWith("/") ? needle[0] + to + needle[0] : to
            const before = updated
            updated = updated.split(needle).join(replacement)
            replacements += before.split(needle).length - 1
        }
    }
    if (updated !== original) {
        await writeFile(file, updated)
        filesChanged++
        console.log(`  rewrote ${file}`)
    }
}

console.log(
    `\nuploaded ${mapping.size}, failed ${failed}, ` +
    `${replacements} references rewritten across ${filesChanged} files`
)

const unreferenced = localJobs.filter((j) => !j.referenced).map((j) => j.from)
if (unreferenced.length) {
    console.log(
        `\nUploaded but not referenced from code (safe to delete from public/):\n  ` +
        unreferenced.join("\n  ")
    )
}
