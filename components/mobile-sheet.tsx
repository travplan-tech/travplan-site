"use client"

import { useCallback, useEffect, useState } from "react"
import { X } from "lucide-react"

/**
 * Bottom sheet shell for the phone navigation bar.
 *
 * Height is fixed rather than content-sized, so the panel does not jump as
 * results come and go while typing — the list scrolls inside instead.
 */
export default function MobileSheet({
    open,
    onClose,
    title,
    children,
    header,
}: {
    open: boolean
    onClose: () => void
    title: string
    /** Pinned under the title, above the scrolling area. */
    header?: React.ReactNode
    children: React.ReactNode
}) {
    // Drives the slide-in. The sheet mounts translated down, then transitions
    // up on the next frame — animating straight from mount does nothing,
    // because the browser has no previous value to transition from.
    const [shown, setShown] = useState(false)

    const close = useCallback(() => {
        setShown(false)
        // Let the slide-down finish before unmounting.
        setTimeout(onClose, 200)
    }, [onClose])

    useEffect(() => {
        if (!open) return
        const raf = requestAnimationFrame(() => setShown(true))
        return () => cancelAnimationFrame(raf)
    }, [open])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
        document.addEventListener("keydown", onKey)
        // Stop the page behind the sheet from scrolling with it.
        const previous = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = previous
        }
    }, [open, close])

    if (!open) return null

    return (
        <div
            className="md:hidden fixed inset-0 z-[60]"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <button
                type="button"
                aria-label="Close"
                onClick={close}
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"
                    }`}
            />

            <div
                className={`absolute inset-x-0 bottom-0 flex flex-col h-[85vh] bg-white rounded-t-2xl shadow-2xl transition-transform duration-200 ease-out ${shown ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <span className="block w-10 h-1 rounded-full bg-gray-300" aria-hidden="true" />
                </div>

                <div className="flex items-center justify-between gap-3 px-4 pb-3 shrink-0">
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="p-1.5 -mr-1.5 rounded-full text-gray-400 hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {header}

                <div className="flex-1 overflow-y-auto px-2 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                    {children}
                </div>
            </div>
        </div>
    )
}

/** Shared row styling, so both sheets list things the same way. */
export function SheetRow({
    onClick,
    thumbnail,
    title,
    subtitle,
}: {
    onClick: () => void
    thumbnail: React.ReactNode
    title: React.ReactNode
    subtitle?: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 w-full text-left p-2 rounded-xl active:bg-gray-100 transition-colors"
        >
            <span className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {thumbnail}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900 truncate">{title}</span>
                {subtitle && (
                    <span className="block text-xs text-gray-500 truncate">{subtitle}</span>
                )}
            </span>
        </button>
    )
}

/** Loading placeholder matching SheetRow's shape. */
export function SheetRowSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="px-2 space-y-2 pt-1" aria-hidden="true">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-1/2 rounded bg-gray-200" />
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                    </div>
                </div>
            ))}
        </div>
    )
}
