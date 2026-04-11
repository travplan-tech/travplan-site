"use client"

import { usePathname } from "next/navigation"
import type React from "react"

interface LayoutWrapperProps {
    children: React.ReactNode
    header: React.ReactNode
    footer: React.ReactNode
}

export function LayoutWrapper({ children, header, footer }: LayoutWrapperProps) {
    const pathname = usePathname()

    // Hide header and footer on admin pages and auth pages
    const isAdminPage = pathname?.startsWith("/admin")
    const isAuthPage = pathname?.startsWith("/auth")
    const hideLayout = isAdminPage || isAuthPage

    return (
        <>
            {!hideLayout && header}
            {children}
            {!hideLayout && footer}
        </>
    )
}
