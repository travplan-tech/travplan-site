"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

interface Destination {
    id: number
    name: string
    image?: string | null
}

/**
 * A row of destinations that drifts on its own but stays fully scrollable.
 *
 * The drift is a scrollLeft animation rather than a CSS transform, so the same
 * container the animation moves is the one the visitor can drag, swipe or
 * wheel. Touching it pauses the drift; it resumes a moment after they stop.
 */
export default function DestinationMarqueeRow({
    destinations,
    direction = "left",
    speed = 0.4,
}: {
    destinations: Destination[]
    /** "left" drifts right-to-left, "right" drifts left-to-right */
    direction?: "left" | "right"
    speed?: number
}) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Two copies is the minimum for a seamless wrap, but a short list on a wide
    // screen would not overflow at all, so repeat until there is plenty to move.
    const copies = Math.max(2, Math.ceil(14 / Math.max(destinations.length, 1)) * 2)
    const items = Array.from({ length: copies }, () => destinations).flat()
    const pausedUntil = useRef(0)
    const position = useRef(0)
    const dragging = useRef(false)
    const dragStart = useRef({ x: 0, scroll: 0 })

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        // Start part-way in so the "right" direction has room to drift into.
        el.scrollLeft = el.scrollWidth / copies
        position.current = el.scrollLeft

        let frame = 0
        const step = () => {
            frame = requestAnimationFrame(step)
            if (!el) return

            // While the visitor is in control, follow the element rather than
            // driving it, so the drift resumes from wherever they left it.
            if (dragging.current || Date.now() < pausedUntil.current) {
                position.current = el.scrollLeft
                return
            }

            // One copy's width: wrapping by exactly this is invisible because
            // the next copy is identical.
            const span = el.scrollWidth / copies
            if (span <= 0 || el.scrollWidth <= el.clientWidth) return

            // scrollLeft is rounded to whole pixels by the browser, so a
            // sub-pixel step added straight to it would never accumulate and
            // the row would sit still. Keep the real position here instead.
            position.current += direction === "left" ? speed : -speed

            if (position.current >= span * (copies - 1)) position.current -= span
            else if (position.current <= 0) position.current += span

            el.scrollLeft = position.current
        }

        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [direction, speed, destinations.length, copies])

    // Any manual interaction wins; drift resumes 2s after it stops.
    const hold = () => {
        pausedUntil.current = Date.now() + 2000
    }

    return (
        <div
            ref={scrollRef}
            onWheel={hold}
            onTouchStart={hold}
            onTouchMove={hold}
            onMouseMove={() => {
                if (dragging.current) hold()
            }}
            onPointerDown={(e) => {
                const el = scrollRef.current
                if (!el) return
                dragging.current = true
                dragStart.current = { x: e.clientX, scroll: el.scrollLeft }
                el.setPointerCapture?.(e.pointerId)
            }}
            onPointerMove={(e) => {
                const el = scrollRef.current
                if (!el || !dragging.current) return
                el.scrollLeft = dragStart.current.scroll - (e.clientX - dragStart.current.x)
            }}
            onPointerUp={(e) => {
                dragging.current = false
                scrollRef.current?.releasePointerCapture?.(e.pointerId)
                hold()
            }}
            onPointerCancel={() => {
                dragging.current = false
                hold()
            }}
            style={{ touchAction: "pan-x", overscrollBehaviorX: "contain" }}
            className="flex gap-6 md:gap-8 overflow-x-auto cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
            {items.map((dest, i) => (
                <Link
                    key={`${dest.id}-${i}`}
                    href={`/tours?search=${encodeURIComponent(dest.name)}`}
                    draggable={false}
                    className="flex flex-col items-center gap-3 group/item w-32 md:w-40 shrink-0"
                >
                    <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full shadow-md ring-2 ring-transparent group-hover/item:ring-primary transition-all duration-300">
                        <Image
                            src={dest.image || "/placeholder.jpg"}
                            alt={dest.name}
                            fill
                            draggable={false}
                            sizes="(max-width: 768px) 128px, 160px"
                            className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                        />
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-700 text-center group-hover/item:text-primary transition-colors w-full px-1 line-clamp-2">
                        {dest.name}
                    </span>
                </Link>
            ))}
        </div>
    )
}
