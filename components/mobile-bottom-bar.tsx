"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, Phone, Search } from "lucide-react"
import MobileSearchSheet from "@/components/mobile-search-sheet"
import MobileDestinationsSheet from "@/components/mobile-destinations-sheet"

const HOME = { href: "/", label: "Home", icon: Home }
const CONTACT = { href: "/contact", label: "Contact", icon: Phone }

/**
 * Fixed bottom navigation for phones — always visible, never tied to scroll.
 * Hidden from md up, where the normal header is always on screen.
 *
 * Search is a button rather than a link: it opens a bottom sheet so the
 * visitor can search without losing the page they are on.
 */
export default function MobileBottomBar() {
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [destinationsOpen, setDestinationsOpen] = useState(false)

    // Checkout and admin screens have their own controls at the bottom.
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href)

    const itemClass = (active: boolean) =>
        `flex flex-col items-center justify-center gap-1 w-full py-2.5 transition-colors ${active ? "text-primary" : "text-gray-500"
        }`

    const iconClass = (active: boolean) =>
        `flex items-center justify-center w-9 h-7 rounded-full transition-colors ${active ? "bg-primary/10" : ""
        }`

    return (
        <>
            <nav aria-label="Primary" className="md:hidden fixed inset-x-0 bottom-0 z-50">
                <ul className="flex items-stretch justify-around bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
                    <li className="flex-1">
                        <Link
                            href={HOME.href}
                            aria-current={isActive(HOME.href) ? "page" : undefined}
                            className={itemClass(isActive(HOME.href))}
                        >
                            <span className={iconClass(isActive(HOME.href))}>
                                <HOME.icon size={18} aria-hidden="true" />
                            </span>
                            <span className="text-[11px] font-medium leading-none">{HOME.label}</span>
                        </Link>
                    </li>

                    <li className="flex-1">
                        <button
                            type="button"
                            onClick={() => setDestinationsOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={destinationsOpen}
                            className={itemClass(destinationsOpen || isActive("/destinations"))}
                        >
                            <span className={iconClass(destinationsOpen || isActive("/destinations"))}>
                                <MapPin size={18} aria-hidden="true" />
                            </span>
                            <span className="text-[11px] font-medium leading-none">Destinations</span>
                        </button>
                    </li>

                    <li className="flex-1">
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={searchOpen}
                            className={itemClass(searchOpen)}
                        >
                            <span className={iconClass(searchOpen)}>
                                <Search size={18} aria-hidden="true" />
                            </span>
                            <span className="text-[11px] font-medium leading-none">Search</span>
                        </button>
                    </li>

                    <li className="flex-1">
                        <Link
                            href={CONTACT.href}
                            aria-current={isActive(CONTACT.href) ? "page" : undefined}
                            className={itemClass(isActive(CONTACT.href))}
                        >
                            <span className={iconClass(isActive(CONTACT.href))}>
                                <CONTACT.icon size={18} aria-hidden="true" />
                            </span>
                            <span className="text-[11px] font-medium leading-none">{CONTACT.label}</span>
                        </Link>
                    </li>

                </ul>
            </nav>

            <MobileSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
            <MobileDestinationsSheet
                open={destinationsOpen}
                onClose={() => setDestinationsOpen(false)}
            />
        </>
    )
}
