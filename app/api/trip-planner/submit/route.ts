import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendTripPlanToExpert } from "@/lib/email"

// POST - Submit trip plan and send to expert
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Please login to submit trip plan" }, { status: 401 })
        }

        const body = await request.json()
        const { tripPlan, expertId } = body

        if (!tripPlan || !expertId) {
            return NextResponse.json(
                { error: "Trip plan and expert ID are required" },
                { status: 400 }
            )
        }

        // Get expert details
        const expert = await prisma.tripExpert.findUnique({
            where: { id: expertId },
        })

        if (!expert) {
            return NextResponse.json(
                { error: "Expert not found" },
                { status: 404 }
            )
        }

        if (!expert.email) {
            return NextResponse.json(
                { error: "Expert email not configured" },
                { status: 400 }
            )
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Send email to expert
        const emailResult = await sendTripPlanToExpert({
            customerName: user.name || "Customer",
            customerEmail: user.email,
            customerPhone: user.phone || undefined,

            country: tripPlan.country,
            groupType: tripPlan.groupType,
            adultsCount: tripPlan.adultsCount,
            childrenCount: tripPlan.childrenCount,
            dateType: tripPlan.dateType,
            startDate: tripPlan.startDate,
            endDate: tripPlan.endDate,
            preferredMonth: tripPlan.preferredMonth,
            tripDuration: tripPlan.tripDuration,
            ageGroup: tripPlan.ageGroup,
            tourType: tripPlan.tourType,
            accommodation: tripPlan.accommodation,
            budgetPerPerson: tripPlan.budgetPerPerson,
            budgetFlexible: tripPlan.budgetFlexible,
            planningStage: tripPlan.planningStage,
            tripTitle: tripPlan.tripTitle,
            tripDescription: tripPlan.tripDescription,

            expertName: expert.name,
            expertEmail: expert.email,
        })

        if (!emailResult.success) {
            return NextResponse.json(
                { error: "Failed to send email to expert" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Trip plan sent to expert successfully",
            expertName: expert.name
        })
    } catch (error) {
        console.error("Failed to submit trip plan:", error)
        return NextResponse.json(
            { error: "Failed to submit trip plan" },
            { status: 500 }
        )
    }
}
