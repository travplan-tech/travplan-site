"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, MapPin, Calendar, TrendingUp, IndianRupee } from "lucide-react"

interface RecentActivity {
    id: number
    type: "booking"
    title: string
    subtitle: string
    amount: number
    status: string
    createdAt: string
}

interface AdminStats {
    totalUsers: number
    totalBookings: number
    totalRevenue: number
    totalPackages: number
    totalDestinations: number
    recentBookings: number
    monthlyGrowth: number
    pendingBookings: number
    recentActivity: RecentActivity[]
}

interface AdminDashboardClientProps {
    initialStats: AdminStats
}

export default function AdminDashboardClient({ initialStats }: AdminDashboardClientProps) {
    const stats = initialStats

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-primary",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: Calendar,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: IndianRupee,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Packages",
            value: stats.totalPackages,
            icon: Package,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Destinations",
            value: stats.totalDestinations,
            icon: MapPin,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Pending Bookings",
            value: stats.pendingBookings,
            icon: TrendingUp,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome to your admin dashboard. Here's an overview of your travel agency.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                        <div className={`p-2 rounded-full ${activity.status === "CONFIRMED"
                                            ? "bg-green-100"
                                            : activity.status === "PENDING"
                                                ? "bg-yellow-100"
                                                : "bg-red-100"
                                            }`}>
                                            <Calendar className={`h-4 w-4 ${activity.status === "CONFIRMED"
                                                ? "text-green-600"
                                                : activity.status === "PENDING"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {activity.subtitle}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-foreground">
                                                ₹{activity.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    No recent activity
                                </div>
                            )}

                            {/* Summary stats */}
                            <div className="border-t pt-4 mt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Last 24 hours</span>
                                    <span className="font-medium text-foreground">{stats.recentBookings} new bookings</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Monthly Growth</span>
                                    <span className={`font-medium ${stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {stats.monthlyGrowth >= 0 ? "+" : ""}{stats.monthlyGrowth}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <a
                                href="/admin/packages"
                                className="block p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                <p className="text-sm font-medium text-foreground">Add New Package</p>
                                <p className="text-xs text-muted-foreground">Create a new travel package</p>
                            </a>
                            <a
                                href="/admin/destinations"
                                className="block p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                <p className="text-sm font-medium text-foreground">Add Destination</p>
                                <p className="text-xs text-muted-foreground">Add a new travel destination</p>
                            </a>
                            <a
                                href="/admin/bookings"
                                className="block p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                <p className="text-sm font-medium text-foreground">View All Bookings</p>
                                <p className="text-xs text-muted-foreground">Manage customer bookings</p>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
