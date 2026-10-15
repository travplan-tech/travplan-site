/**
 * Analytics events.
 *
 * Nothing was being measured: no GA4, GTM or Pixel anywhere on the site, so
 * there was no way to tell which pages or trips produce enquiries. These
 * helpers push to GA4 when NEXT_PUBLIC_GA_ID is set, and do nothing at all
 * when it is not — so the site behaves identically before the ID is added,
 * and no call site needs a guard.
 *
 * The live property's id ships as the default. Set NEXT_PUBLIC_GA_ID to point
 * at a different property, or to "off" to disable analytics entirely.
 * NEXT_PUBLIC_GTM_ID is supported instead if you would rather manage tags
 * through Tag Manager.
 */

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
    }
}

/**
 * A GA4 measurement id is not a secret — it is visible in the page source of
 * every site that uses one — so the property's own id is the default and the
 * env var is an override, for a staging property or to switch it off.
 */
const DEFAULT_GA_ID = "G-PF2EKVQ3KD"

export const GA_ID =
    process.env.NEXT_PUBLIC_GA_ID === "off" ? "" : (process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID)
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ""
export const analyticsEnabled = Boolean(GA_ID || GTM_ID)

/** The conversions worth counting, named so a report reads plainly. */
export type AnalyticsEvent =
    | "enquiry_submitted"
    | "brochure_requested"
    | "whatsapp_click"
    | "phone_click"
    | "booking_started"
    | "booking_completed"
    | "trip_viewed"
    | "search_performed"

/**
 * Records one event. Safe to call anywhere, including during SSR and before
 * the tag has loaded — queued on dataLayer either way.
 */
export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
    if (typeof window === "undefined" || !analyticsEnabled) return
    try {
        window.dataLayer = window.dataLayer || []
        if (GA_ID && typeof window.gtag === "function") {
            window.gtag("event", event, params)
        } else {
            // GTM, or gtag.js not loaded yet: the push is picked up when it is.
            window.dataLayer.push({ event, ...params })
        }
    } catch (error) {
        // Analytics must never break a booking flow.
        console.error("analytics:", error)
    }
}

/** Page view, for client-side navigations GA4 does not catch on its own. */
export function trackPageView(path: string) {
    if (typeof window === "undefined" || !analyticsEnabled) return
    try {
        if (GA_ID && typeof window.gtag === "function") {
            window.gtag("event", "page_view", { page_path: path })
        } else {
            window.dataLayer = window.dataLayer || []
            window.dataLayer.push({ event: "page_view", page_path: path })
        }
    } catch (error) {
        console.error("analytics:", error)
    }
}
