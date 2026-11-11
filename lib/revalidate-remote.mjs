/**
 * Asks the deployed site to drop cache tags after a seed script has changed
 * the database directly.
 *
 * A script writes to the database the site reads, but the rendered pages live
 * in Vercel's cache, so without this a seeded post stays invisible behind a
 * cached index until its window expires.
 *
 * No-ops with a warning when REVALIDATE_SECRET or SITE_URL is missing, so a
 * seed never fails over a cache concern.
 */
export async function revalidateRemote(tags) {
    const secret = process.env.REVALIDATE_SECRET
    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.travplan.in"

    if (!secret) {
        console.warn(
            `\n  ! REVALIDATE_SECRET not set - ${site} will keep serving cached pages.\n` +
            `    Set it in .env.local and in the Vercel project, or the change stays invisible.`
        )
        return false
    }

    try {
        const res = await fetch(`${site}/api/revalidate`, {
            method: "POST",
            headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
            body: JSON.stringify({ tags }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
            console.warn(`  ! revalidate failed: ${res.status} ${JSON.stringify(body)}`)
            return false
        }
        console.log(`  revalidated ${tags.join(", ")} on ${site}`)
        return true
    } catch (e) {
        console.warn(`  ! revalidate request failed: ${e.message}`)
        return false
    }
}
