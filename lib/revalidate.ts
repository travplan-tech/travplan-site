import { revalidateTag } from "next/cache"

/**
 * Cache tags used by the unstable_cache entries that feed the public pages.
 *
 * Pages can afford long revalidate windows only because the admin write
 * routes drop the matching tag the moment content changes. Without that, the
 * TTL is the only way a change ever reaches a visitor, which is what forced
 * the short windows that burned through the ISR write budget.
 */
export type CacheTag =
    | "active-sale"
    | "blogs"
    | "destinations"
    | "experts"
    | "feature-boxes"
    | "homepage-settings"
    | "packages"
    | "reviews"

/**
 * Drop one or more cache tags. Safe to call on an error path too: the cost of
 * an unnecessary revalidation is one extra render, while a missed one leaves
 * the site showing stale content for a day.
 */
// Next 16 wants a cache-life profile saying how long the invalidation marker
// must outlive the entries it clears. It matches the longest window any cache
// here uses, so no entry can survive its own invalidation.
const EXPIRE = { expire: 86400 }

export function revalidateTags(...tags: CacheTag[]) {
    for (const tag of tags) {
        try {
            revalidateTag(tag, EXPIRE)
        } catch (error) {
            // Never let a cache concern fail a write the admin already made.
            console.error(`revalidateTag(${tag}) failed`, error)
        }
    }
}
