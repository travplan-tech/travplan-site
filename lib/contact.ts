/**
 * The one place the sales number lives.
 *
 * It was previously typed out in the homepage, the contact page, the privacy
 * page and the footer in four different formats, so changing it meant finding
 * every copy. Anything that calls, messages or displays it reads from here.
 */
export const PHONE_NUMBER = "+91 70119 90884"

/** E.164, for tel: and wa.me, which both reject spaces and punctuation. */
export const PHONE_E164 = "917011990884"

export const PHONE_HREF = `tel:+${PHONE_E164}`

/**
 * WhatsApp deep link, optionally pre-filled.
 *
 * The prefilled text matters more than it looks: an enquiry that arrives
 * saying which trip it is about can be answered immediately, where a bare
 * "hi" costs a round trip before the conversation even starts.
 */
export function whatsappUrl(message?: string): string {
    const base = `https://wa.me/${PHONE_E164}`
    return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** "…about the Kerala Backwaters trip", or a sensible fallback. */
export function enquiryMessage(context?: string | null): string {
    return context
        ? `Hi Travplan, I'd like to know more about ${context}.`
        : "Hi Travplan, I'd like help planning a trip."
}
