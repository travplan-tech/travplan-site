import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AdminDashboardClient from "./AdminDashboardClient"

// Fetch admin stats server-side
async function getAdminStats() {
    try {
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        // Sequential execution to prevent connection pooling issues
        const totalUsers = await prisma.user.count()
        const totalBookings = await prisma.booking.count()
        const totalPackages = await prisma.package.count()
        const totalDestinations = await prisma.destination.count()

        const recentBookingsCount = await prisma.booking.count({
            where: { createdAt: { gte: yesterday } },
        })

        const pendingBookings = await prisma.booking.count({
            where: { status: "PENDING" },
        })

        const revenueData = await prisma.booking.aggregate({
            _sum: { totalPrice: true }
        })

        const thisMonthBookings = await prisma.booking.count({
            where: { createdAt: { gte: startOfCurrentMonth } }
        })

        const lastMonthBookings = await prisma.booking.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            }
        })

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
        })

        // Post-processing
        const totalRevenue = revenueData._sum.totalPrice || 0
        const monthlyGrowth = lastMonthBookings > 0
            ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
            : thisMonthBookings > 0 ? 100 : 0

        const recentActivity = latestBookings.map((booking) => ({
            id: booking.id,
            type: "booking" as const,
            title: booking.guestName,
            subtitle: booking.package?.title || "Custom Trip",
            amount: booking.totalPrice,
            status: booking.status,
            createdAt: booking.createdAt.toISOString(),
        }))

        return {
            totalUsers,
            totalBookings,
            totalRevenue: Math.round(totalRevenue),
            totalPackages,
            totalDestinations,
            recentBookings: recentBookingsCount,
            monthlyGrowth: Math.round(monthlyGrowth),
            pendingBookings,
            recentActivity,
        }
    } catch (error) {
        console.error("Error fetching admin stats:", error)
        // Return default values on error
        return {
            totalUsers: 0,
            totalBookings: 0,
            totalRevenue: 0,
            totalPackages: 0,
            totalDestinations: 0,
            recentBookings: 0,
            monthlyGrowth: 0,
            pendingBookings: 0,
            recentActivity: [],
        }
    }
}

export default async function AdminDashboard() {
    // Check authentication server-side
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
        redirect("/login?callbackUrl=/admin")
    }

    // Fetch stats server-side
    const stats = await getAdminStats()

    return <AdminDashboardClient initialStats={stats} />
}
