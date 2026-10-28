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
    "manali-town-snowpeaks": "1597167231350-d057a45dc868",
    "manali-valley-river": "1678261151315-887e2dd253e8",
    "manali-old-cafe-street": "1571677465484-2dd540924245",
    "manali-pine-mountain": "1565610468500-adc61f362be5",
    "solang-paragliding": "1497267049703-01d7eb538c99",
    "solang-snow-group": "1679407985687-08a86c5c53ba",
    "kasol-riverside": "1652501835967-c8fdb202e098",
    "kasol-town-mountains": "1652379379235-652d2a6d65e8",
    "parvati-valley-river": "1652501834567-937de29c4533",
    "parvati-river-forest": "1673815994546-9913f4d76b77",
    "kashmir-dal-houseboats": "1595815771614-ade9d652a65d",
    "kashmir-dal-shikaras": "1715457573748-8e8a70b2c1be",
    "kashmir-dal-reflection": "1614591276564-7b3e69347a48",
    "kashmir-dal-fruit-seller": "1564327287902-0ccf559d839e",
    "kashmir-dal-floating-village": "1768147765107-5eef8e032a62",
    "kashmir-meadow-village": "1646204892016-711ed35535ec",
    "kashmir-meadow-horses": "1666545380922-1296a4ac9521",
    "kashmir-meadow-mountains": "1666545378454-b605635dd55d",
    "kashmir-valley-river": "1666513307023-5967bf290101",
    "kashmir-snow-range": "1716099933931-628733759685",
    "meghalaya-nohkalikai-falls": "1637043765564-a071ff91a09f",
    "meghalaya-waterfall-aerial": "1685346388921-26dd3ae934be",
    "meghalaya-living-root-bridge": "1742494267580-e026d3737f65",
    "meghalaya-waterfall-scale": "1594514113865-d1deac339435",
    "kerala-houseboat-backwaters": "1506461883276-594a12b11cf3",
    "kerala-tea-hills": "1714489896584-233675ee2f62",
    "kerala-lake-periyar": "1594034279458-0188b77b943c",
    "spiti-key-monastery": "1653844573020-71f77a0ccb8c",
    "spiti-key-monastery-snow": "1746093846930-ab89242b9fb9",
    "spiti-monastery-range": "1746037299530-8ad5d2061435",
    "spiti-key-golden-hour": "1652514284048-a297d43ab05d",
    "tawang-prayer-flags-sunrise": "1668437824006-1be44600774b",
    "tawang-sunset-range": "1639134956519-3ce73019ef84",
    "tawang-monastery-monk": "1628070018796-a9f4e2dd482a",
}

const urls = {}
let failed = 0

// --only <substr,substr> uploads just the matching names, so adding a set
// later does not re-upload everything already in TravPlan/stock.
const onlyArg = process.argv[process.argv.indexOf("--only") + 1]
const only = process.argv.includes("--only") && onlyArg ? onlyArg.split(",") : null

for (const [name, id] of Object.entries(PHOTOS)) {
    if (only && !only.some((frag) => name.includes(frag))) continue
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
