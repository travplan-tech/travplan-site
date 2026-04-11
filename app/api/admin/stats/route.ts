import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

/**
 * Optimized Admin Stats Route
 * Runs queries sequentially to prevent connection pooling errors 
 * in serverless environments.
 */
export async function GET() {
    try {
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        // --- Sequential Execution ---
        // Instead of Promise.all, we run these one by one to keep connection usage minimal

        const totalUsers = await prisma.user.count();
        const totalBookings = await prisma.booking.count();
        const totalPackages = await prisma.package.count();
        const totalDestinations = await prisma.destination.count();

        const recentBookingsCount = await prisma.booking.count({
            where: { createdAt: { gte: yesterday } },
        });

        const pendingBookings = await prisma.booking.count({
            where: { status: "PENDING" },
        });

        const revenueData = await prisma.booking.aggregate({
            _sum: { totalPrice: true }
        });

        const thisMonthBookings = await prisma.booking.count({
            where: { createdAt: { gte: startOfCurrentMonth } }
        });

        const lastMonthBookings = await prisma.booking.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            }
        });

        const latestBookings = await prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                guestName: true,
                totalPrice: true,
                status: true,
                createdAt: true,
                package: { select: { title: true } }
            }
        });

        // --- Post-Processing ---

        const totalRevenue = revenueData._sum.totalPrice || 0;
        const monthlyGrowth = lastMonthBookings > 0
            ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
            : thisMonthBookings > 0 ? 100 : 0;

        const recentActivity = latestBookings.map((booking) => ({
            id: booking.id,
            type: "booking" as const,
            title: booking.guestName,
            subtitle: booking.package?.title || "Custom Trip",
            amount: booking.totalPrice,
            status: booking.status,
            createdAt: booking.createdAt,
        }));

        return NextResponse.json({
            totalUsers,
            totalBookings,
            totalRevenue: Math.round(totalRevenue),
            totalPackages,
            totalDestinations,
            recentBookings: recentBookingsCount,
            monthlyGrowth: Math.round(monthlyGrowth),
            pendingBookings,
            recentActivity,
        })
    } catch (error: any) {
        console.error("Error fetching admin stats:", error)
        const detail = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: `Internal Server Error: ${detail.substring(0, 100)}...` },
            { status: 500 }
        )
    }
}
