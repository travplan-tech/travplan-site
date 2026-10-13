/**
 * Adds delivery transformations to the Cloudinary URLs in the source.
 *
 * Migrating the hotlinked stock photos stored Cloudinary a full-resolution
 * master, but the code used to request a resized variant (`?w=1000`), so
 * without this the pages would ship multi-megabyte originals. `f_auto,q_auto`
 * lets Cloudinary pick the format and quality, and `w_<n>,c_limit` caps the
 * width at what the layout actually asked for — c_limit never upscales.
 *
 * Re-runnable: a URL that already carries a transformation is left alone.
 *
 *   node scripts/apply-cdn-transforms.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const SOURCE_DIRS = ["app", "components", "lib"]

/** Widths the code originally asked Unsplash for, keyed by photo id. */
const STOCK_WIDTHS = {
    "1467377791767-c929b5dc9a23": 1000, "1483070472046-4defb528eff3": 1000,
    "1488646953014-85cb44e25828": 400, "1493976040374-85c8e12f0c0e": 400,
    "1497256654106-4a29efafb831": 1000, "1512343879784-a960bf40e7f2": 1000,
    "1512453979798-5ea266f8880c": 1000, "1518548419970-58e3b4079ab2": 1000,
    "1524492412937-b28074a5d7da": 400, "1525625293386-3f8f99389edd": 1000,
    "1528127269322-539801943592": 1000, "1534008897995-27a23e859048": 1000,
    "1537996194471-e657df975ab4": 400, "1539635278303-d4002c07eae3": 600,
    "1542314831-068cd1dbfeeb": 2070, "1544644181-1484b3fdfc62": 1000,
    "1547378809-db8f9515a63b": 1000, "1548013146-72479768bada": 600,
    "1552465011-b4e21bf6e79a": 400, "1566914447826-bf04e54bf1be": 1000,
    "1573843981267-be1999ff37cd": 1000, "1581791534721-e599df4417f7": 1000,
    "1585914285309-4b1fe30b53ed": 1000, "1589983846997-04788035bc83": 1000,
    "1596422846543-75c6fc197f07": 1000, "1600100397849-3a782cfd8492": 1000,
    "1600402808924-9c591a6dace8": 1000, "1602216056096-3b40cc0c9944": 1000,
    "1620103143245-9efb3e4a7553": 1000, "1631867675167-90a456a90863": 1000,
    "1634148551170-d37d021e0cc9": 1000, "1715457573748-8e8a70b2c1be": 1000,
    "1764014588235-d339ae275f19": 600, "1764071289023-227898d0d827": 600,
    "1764276266750-4d6316e972e0": 1173,
}

/** Nothing on the site is displayed wider than this. */
const MAX_WIDTH = 1920

async function walk(dir) {
    const out = []
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) out.push(...(await walk(full)))
        else out.push(full)
    }
    return out
}

const files = (await Promise.all(SOURCE_DIRS.map(walk)))
    .flat()
    .filter((f) => /\.(tsx?|mjs)$/.test(f))

// Matches .../image/upload/<version>/<public id>, i.e. a URL with no
// transformation segment yet.
const PLAIN = /(https:\/\/res\.cloudinary\.com\/[a-z0-9]+\/image\/upload\/)(v\d+\/)/g

let changed = 0
let rewritten = 0

for (const file of files) {
    const original = await readFile(file, "utf8")

    const updated = original.replace(PLAIN, (whole, prefix, version, offset, str) => {
        // Look ahead at the public id to decide the width.
        const rest = str.slice(offset + whole.length, offset + whole.length + 120)
        const stockId = rest.match(/stock\/unsplash-([0-9a-f-]+)/i)?.[1]
        const width = stockId ? STOCK_WIDTHS[stockId] || MAX_WIDTH : MAX_WIDTH
        rewritten++
        return `${prefix}f_auto,q_auto,w_${width},c_limit/${version}`
    })

    if (updated !== original) {
        await writeFile(file, updated)
        changed++
        console.log(`  ${file}`)
    }
}

console.log(`\n${rewritten} URLs given transformations across ${changed} files`)
