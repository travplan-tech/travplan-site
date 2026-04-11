import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
    const { user, error, status } = await requireAdmin()

    if (error) {
        return NextResponse.json({ error, isAdmin: false }, { status: status || 403 })
    }

    return NextResponse.json({ isAdmin: true, user: { email: user?.email, role: user?.role } })
}
