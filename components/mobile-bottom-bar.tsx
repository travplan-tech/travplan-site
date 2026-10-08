"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, Phone, Search } from "lucide-react"

const ITEMS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/destinations", label: "Destinations", icon: MapPin },
    { href: "/tours", label: "Search", icon: Search },
    { href: "/contact", label: "Contact", icon: Phone },
]

/**
 * Fixed bottom navigation for phones — always visible, never tied to scroll.
 * Hidden from md up, where the normal header is always on screen.
 */
export default function MobileBottomBar() {
    const pathname = usePathname()

    // Checkout and admin screens have their own controls at the bottom.
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null

    return (
        <nav
            aria-label="Primary"
            className="md:hidden fixed inset-x-0 bottom-0 z-50"
        >
            <ul className="flex items-stretch justify-around bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
                {ITEMS.map((item) => {
                    const Icon = item.icon
                    const active =
                        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

                    return (
                        <li key={item.href} className="flex-1">
                            <Link
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${active ? "text-primary" : "text-gray-500"
                                    }`}
                            >
                                <span
                                    className={`flex items-center justify-center w-9 h-7 rounded-full transition-colors ${active ? "bg-primary/10" : ""
                                        }`}
                                >
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                <span className="text-[11px] font-medium leading-none">{item.label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
