import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

export async function requireAuth() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { error: "Unauthorized", status: 401 as const, user: null }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

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

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return { error: "User not found", status: 404 as const, user: null }
    }

    if (user.role !== "ADMIN") {
        return { error: "Forbidden - Admin access required", status: 403 as const, user: null }
    }

    return { user, error: null, status: null }
}
