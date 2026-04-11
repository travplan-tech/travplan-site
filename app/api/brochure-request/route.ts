import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBrochureRequestEmail, sendCouponEmail } from "@/lib/email"

// Generate a unique coupon code
function generateCouponCode(): string {
    const prefix = "BROCHURE"
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `${prefix}${code}`
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, packageId, packageName, needsCallback, brochureUrl } = body

        // Validate required fields
        if (!email || !packageId || !packageName) {
            return NextResponse.json(
                { error: "Email, package ID, and package name are required" },
                { status: 400 }
            )
        }

        // Basic email validation
        if (!email.includes("@")) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            )
        }

        // Generate coupon code
        let couponCode = generateCouponCode()

        // Ensure unique code
        let attempts = 0
        while (attempts < 5) {
            const existing = await prisma.coupon.findUnique({
                where: { code: couponCode }
            })
            if (!existing) break
            couponCode = generateCouponCode()
            attempts++
        }

        // Calculate expiry date (5 days from now)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 5)

        // Create coupon in database
        const coupon = await prisma.coupon.create({
            data: {
                code: couponCode,
                discountType: "PERCENTAGE",
                discountValue: 5,
                email,
                packageId: parseInt(packageId),
                packageName,
                expiresAt,
            }
        })

        // Send notification email to admin
        await sendBrochureRequestEmail({
            email,
            packageId,
            packageName,
            needsCallback,
            brochureUrl,
        })

        // Send coupon email to user
        await sendCouponEmail({
            email,
            couponCode: coupon.code,
            discountPercent: 5,
            expiresAt: coupon.expiresAt,
            packageName,
        })

        return NextResponse.json({
            success: true,
            message: "Brochure request received successfully",
            couponCode: coupon.code,
            expiresAt: coupon.expiresAt,
        })
    } catch (error) {
        console.error("Brochure request error:", error)
        return NextResponse.json(
            { error: "Failed to process brochure request" },
            { status: 500 }
        )
    }
}
