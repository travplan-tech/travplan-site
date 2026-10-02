/**
 * Canonical site configuration.
 *
 * Every canonical URL, Open Graph URL, schema @id and sitemap entry must be
 * built from SITE_URL so the production domain is declared in exactly one
 * place. Override with NEXT_PUBLIC_SITE_URL for preview deployments.
 */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.travplan.in"
).replace(/\/+$/, "")

export const SITE_NAME = "Travplan"

/** Absolute URL for a site-relative path, e.g. absoluteUrl("/about") */
export function absoluteUrl(path = "/"): string {
    if (!path || path === "/") return SITE_URL
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
