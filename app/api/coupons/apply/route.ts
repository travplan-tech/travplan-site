import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST(req: Request) {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 })
        }

        const body = await req.json()
        const { code, packageId, bookingAmount } = body

        if (!code) {
            return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code },
        })

        if (!coupon) {
            return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
        }

        if (coupon.isUsed) {
            return NextResponse.json({ error: "Coupon has already been used" }, { status: 400 })
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
        }

        // Ownership validation
        if (coupon.userId && coupon.userId !== user.id) {
            return NextResponse.json({ error: "This coupon is not valid for your account" }, { status: 403 })
        }

        // Use email check as fallback if userId not set but email is
        if (!coupon.userId && coupon.email && coupon.email !== user.email) {
            return NextResponse.json({ error: "This coupon is not valid for your account" }, { status: 403 })
        }

        // Package specific check
        if (coupon.packageId && packageId && coupon.packageId !== parseInt(packageId)) {
            return NextResponse.json({ error: "This coupon is not valid for this package" }, { status: 400 })
        }

        // Calculate discount
        let discountAmount = 0
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (bookingAmount * coupon.discountValue) / 100
        } else {
            discountAmount = coupon.discountValue
        }

        // Cap discount at total amount
        if (discountAmount > bookingAmount) {
            discountAmount = bookingAmount
        }

        return NextResponse.json({
            valid: true,
            discountAmount,
            finalPrice: bookingAmount - discountAmount,
            code: coupon.code // Return code to confirm
        })

    } catch (error) {
        console.error("Coupon error:", error)
        return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 })
    }
}
