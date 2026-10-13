/**
 * Who is allowed into the admin panel.
 *
 * The database `role` column alone is not enough: anything that flips a row to
 * ADMIN — a mistake on the users screen, a bad import, a compromised account —
 * would hand over the whole admin panel. Access is therefore granted only to
 * an explicit list of addresses, checked server-side on every admin request.
 * A user whose row says ADMIN but whose address is not listed is treated as an
 * ordinary customer: they keep bookings, profile and reviews, and see no admin
 * navigation at all.
 *
 * Set ADMIN_EMAILS (comma separated) to change the list without a code change.
 */
const DEFAULT_ADMIN_EMAILS = [
    "admin@travplan.in",
    "business.travplan@gmail.com",
]

/** Lower-cased, so a different capitalisation in the sign-in form still matches. */
function allowedEmails(): string[] {
    const configured = process.env.ADMIN_EMAILS
    const list = configured
        ? configured.split(",").map((e) => e.trim()).filter(Boolean)
        : DEFAULT_ADMIN_EMAILS
    return list.map((e) => e.toLowerCase())
}

/** True when this address may use the admin panel. */
export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false
    return allowedEmails().includes(email.trim().toLowerCase())
}

/**
 * The role to put on the session. Keeping this in one place means the UI
 * (which hides admin links on role) and the API guards cannot disagree.
 */
export function resolveRole(email: string | null | undefined, dbRole: string | null | undefined): string {
    return isAdminEmail(email) && dbRole === "ADMIN" ? "ADMIN" : "USER"
}
