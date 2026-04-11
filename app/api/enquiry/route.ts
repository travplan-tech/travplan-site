import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEnquiryNotificationEmail, sendEnquiryConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            name,
            email,
            phone,
            packageId,
            packageName,
            preferredDate,
            numberOfTravelers,
            message
        } = body

        // Validate required fields
        if (!name || !email || !phone) {
            return NextResponse.json(
                { error: "Name, email, and phone are required" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        const enquiryData = {
            name,
            email,
            phone,
            packageId: packageId?.toString() || "",
            packageName: packageName || "",
            preferredDate: preferredDate || "",
            numberOfTravelers: numberOfTravelers || "2",
            message: message || ""
        }

        // Save to database
        await prisma.enquiry.create({
            data: {
                name,
                email,
                phone,
                packageId: packageId ? parseInt(packageId) : null,
                packageName: packageName || null,
                preferredDate: preferredDate || null,
                numberOfTravelers: numberOfTravelers || "2",
                message: message || null,
                status: "NEW"
            }
        })

        // Send notification email to admin
        const adminEmailResult = await sendEnquiryNotificationEmail(enquiryData)

        // Send confirmation email to customer
        const customerEmailResult = await sendEnquiryConfirmationEmail(enquiryData)

        if (!adminEmailResult.success) {
            console.error("Failed to send admin notification:", adminEmailResult.error)
        }

        if (!customerEmailResult.success) {
            console.error("Failed to send customer confirmation:", customerEmailResult.error)
        }

        return NextResponse.json({
            success: true,
            message: "Enquiry submitted successfully"
        })

    } catch (error) {
        console.error("Failed to process enquiry:", error)
        return NextResponse.json(
            { error: "Failed to process enquiry" },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const enquiries = await prisma.enquiry.findMany({
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(enquiries)
    } catch (error) {
        console.error("Failed to fetch enquiries:", error)
        return NextResponse.json(
            { error: "Failed to fetch enquiries" },
            { status: 500 }
        )
    }
}
