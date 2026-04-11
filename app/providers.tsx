"use client"

import type React from "react"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Provider store={store}>
                {children}
                <Toaster />
            </Provider>
        </SessionProvider>
    )
}
