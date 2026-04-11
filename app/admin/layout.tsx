"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    MapPin,
    Calendar,
    Users,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Inbox,
    Home,
    UserCheck,
    HelpCircle,
    Percent
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useCheckAdminAccessQuery } from "@/lib/api/adminApi"
import Image from "next/image"

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Homepage", href: "/admin/homepage", icon: Home },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Enquiries", href: "/admin/enquiries", icon: HelpCircle },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Destinations", href: "/admin/destinations", icon: MapPin },
    { name: "Trip Experts", href: "/admin/experts", icon: UserCheck },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Sales", href: "/admin/sales", icon: Percent },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Contact", href: "/admin/contact", icon: Inbox },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    // RTK Query hook for checking admin access
    const { data: accessData, isLoading: checkingAccess, error: accessError } = useCheckAdminAccessQuery(undefined, {
        skip: status !== "authenticated" || !session?.user?.email
    })

    useEffect(() => {
        if (status === "loading" || checkingAccess) return

        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/admin")
            return
        }

        if (accessError) {
            router.push("/?error=unauthorized")
            return
        }

        if (accessData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = accessData as any
            if (data.isAdmin) {
                setIsAdmin(true)
            } else {
                router.push("/?error=unauthorized")
            }
        }
    }, [session, status, router, accessData, accessError, checkingAccess])

    const loading = status === "loading" || checkingAccess

    if (loading || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <Link
                            href="/"
                            className="flex items-center space-x-2"
                        >
                            <Image
                                src="/logo.webp"
                                alt="Travplan Logo"
                                width={40}
                                height={40}
                                className="object-cover h-auto w-8 md:w-10"
                            />
                            <span className="font-bold text-gray-800 md:text-lg">Travplan</span>
                        </Link>
                        <button
                            className="lg:hidden p-1 hover:bg-muted rounded"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? "bg-primary text-white"
                                        : "text-foreground hover:bg-muted"
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </div>
                        <Link
                            href="/auth/signin"
                            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="bg-white border-b border-border sticky top-0 z-30">
                    <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
                        <button
                            className="lg:hidden p-2 hover:bg-muted rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-4 ml-auto">
                            <Link
                                href="/"
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                ← Back to Website
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
