import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const { fullName, email, phone, subject, message } = body

        // Validate required fields
        if (!fullName || !email || !message) {
            return NextResponse.json(
                { error: "Full name, email, and message are required" },
                { status: 400 }
            )
        }

        // Combine subject with message if subject is provided
        const fullMessage = subject
            ? `Subject: ${subject}\n\n${message}`
            : message

        // Create contact message in database
        const contactMessage = await prisma.contactMessage.create({
            data: {
                fullName,
                email,
                phone: phone || "",
                message: fullMessage,
                status: "UNREAD",
            },
        })

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully. We will get back to you soon!",
            id: contactMessage.id,
        })
    } catch (error) {
        console.error("Error creating contact message:", error)
        return NextResponse.json(
            { error: "Failed to send message. Please try again later." },
            { status: 500 }
        )
    }
}
