import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { withDbRetry } from "./db-retry"
import { isAdminEmail } from "./admin-allowlist"

/**
 * Looks the signed-in user up, retrying the database's connection limit.
 *
 * A failed read is reported as 503, never as "User not found": a 404 would
 * tell the caller the account does not exist, which is a different and
 * misleading answer to "the database was briefly unreachable".
 */
async function lookupUser(email: string) {
    return withDbRetry(
        () => prisma.user.findUnique({ where: { email } }),
        { label: "auth lookup" }
    )
}

export async function requireAuth() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { error: "Unauthorized", status: 401 as const, user: null }
    }

    let user
    try {
        user = await lookupUser(session.user.email)
    } catch (error) {
        console.error("requireAuth: could not reach the database", error)
        return { error: "Service temporarily unavailable", status: 503 as const, user: null }
    }

    if (!user) {
        return { error: "User not found", status: 404 as const, user: null }
    }

    return { user, error: null, status: null }
}

export async function requireAdmin() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { error: "Unauthorized", status: 401 as const, user: null }
    }

    let user
    try {
        user = await lookupUser(session.user.email)
    } catch (error) {
        console.error("requireAdmin: could not reach the database", error)
        return { error: "Service temporarily unavailable", status: 503 as const, user: null }
    }

    if (!user) {
        return { error: "User not found", status: 404 as const, user: null }
    }

    // Both must hold: the row has to say ADMIN and the address has to be on
    // the allowlist. Either one alone is not enough to reach the admin panel.
    if (user.role !== "ADMIN" || !isAdminEmail(user.email)) {
        return { error: "Forbidden - Admin access required", status: 403 as const, user: null }
    }

    return { user, error: null, status: null }
}
