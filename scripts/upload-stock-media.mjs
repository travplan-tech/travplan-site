/**
 * Uploads named Unsplash photos into TravPlan/stock as full-resolution masters.
 *
 * Masters go up untouched so Cloudinary has the best source to downscale from;
 * delivery applies f_auto,q_auto,w_N at render time. Named rather than hashed
 * public ids, so an asset stays traceable to what it shows.
 *
 *   node --env-file=.env.local scripts/upload-stock-media.mjs [--dry-run]
 *
 * Re-runnable: public ids are stable, so a second run overwrites in place.
 */
import { writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { v2 as cloudinary } from "cloudinary"

const DRY_RUN = process.argv.includes("--dry-run")
const MAX_BYTES = 10 * 1024 * 1024 // Cloudinary's per-upload cap

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Each was downloaded and looked at before being listed here, so the name
// describes what the photograph actually shows.
const PHOTOS = {
    "varanasi-ghats-temples": "1565354785692-9e7523e5a87b",
    "varanasi-ghats-boats": "1561359313-0639aad49ca6",
    "varanasi-ganga-aarti-fire": "1627894483216-2138af692e32",
    "varanasi-ganga-aarti-lamps": "1705952484283-19c31e37e0e4",
    "varanasi-ghat-steps": "1561361058-c24cecae35ca",
    "varanasi-boat-sunset": "1596097825168-c9b773f404ff",
    "sarnath-dhamek-stupa-sunset": "1757941898945-776cb3673f91",
    "sarnath-dhamek-stupa-ruins": "1771744500663-09db654513aa",
    "sarnath-dhamek-stupa-day": "1773601103540-2e4da9e61970",
    "bodhgaya-mahabodhi-temple": "1679806893392-29f024308936",
    "bodhgaya-great-buddha": "1724303740927-bbb568013fd1",
    "bodhgaya-monks-prayer": "1543252655-02bd4539263e",
    "ayodhya-ram-ki-paidi": "1652059468417-3b44ff25afdf",
    "ayodhya-saryu-riverfront": "1652059468424-249066e3a98f",
    "ayodhya-deity-garlands": "1706169599121-4182eb12fbef",
    "prayagraj-sangam-ritual": "1791727868189-4ca392706837",
    "prayagraj-sangam-boats": "1743332509532-f4c6a854f3c9",
    "prayagraj-sangam-crowd": "1674358596018-5b768ca9cfd1",
}

const urls = {}
let failed = 0

for (const [name, id] of Object.entries(PHOTOS)) {
    const publicId = `TravPlan/stock/${name}`
    // No query string: that fetches the original rather than a resized variant.
    const source = `https://images.unsplash.com/photo-${id}`
    if (DRY_RUN) {
        console.log(`  would upload ${name.padEnd(32)} -> ${publicId}`)
        continue
    }
    try {
        const r = await cloudinary.uploader.upload(source, {
            public_id: publicId,
            overwrite: true,
            resource_type: "image",
        })
        urls[name] = r.secure_url
        console.log(`  ok   ${name.padEnd(32)} ${r.width}x${r.height} ${Math.round(r.bytes / 1024)}KB`)
    } catch (e) {
        // Cloudinary caps an upload at 10MB. A handful of Unsplash originals are
        // larger, so fall back to a 4000px-wide copy: still far above anything
        // the site delivers, and the alternative is no image at all.
        if (!/File size too large/i.test(String(e.message || e))) {
            failed++
            console.error(`  FAIL ${name} :: ${e.message || e}`)
            continue
        }
        try {
            // Step the width down until the encoded file clears the cap, so a
            // very tall photo is not rejected at a width a wide one passes at.
            let buf = null
            for (const w of [4000, 3200, 2600, 2000]) {
                buf = Buffer.from(await (await fetch(`${source}?w=${w}&q=85&fm=jpg`)).arrayBuffer())
                if (buf.byteLength < MAX_BYTES) break
                buf = null
            }
            if (!buf) throw new Error("still over the 10MB cap at 2000px wide")
            const tmp = join(tmpdir(), `${name}.jpg`)
            await writeFile(tmp, buf)
            const r = await cloudinary.uploader.upload(tmp, {
                public_id: publicId,
                overwrite: true,
                resource_type: "image",
            })
            urls[name] = r.secure_url
            console.log(`  ok*  ${name.padEnd(32)} ${r.width}x${r.height} ${Math.round(r.bytes / 1024)}KB (downscaled from original)`)
        } catch (e2) {
            failed++
            console.error(`  FAIL ${name} :: ${e2.message || e2}`)
        }
    }
}

if (DRY_RUN) process.exit(0)

console.log(`\nuploaded ${Object.keys(urls).length}, failed ${failed}\n`)
console.log(JSON.stringify(urls, null, 4))
