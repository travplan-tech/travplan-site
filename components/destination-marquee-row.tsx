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
    speed = 0.35,
}: {
    destinations: Destination[]
    /** "left" drifts right-to-left, "right" drifts left-to-right */
    direction?: "left" | "right"
    speed?: number
}) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const pausedUntil = useRef(0)
    const dragging = useRef(false)
    const dragStart = useRef({ x: 0, scroll: 0 })

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        // Start the "right" direction mid-way so it has somewhere to drift from.
        if (direction === "right") el.scrollLeft = el.scrollWidth / 2

        let frame = 0
        const step = () => {
            frame = requestAnimationFrame(step)
            if (!el || dragging.current || Date.now() < pausedUntil.current) return

            const half = el.scrollWidth / 2
            if (half <= 0) return

            el.scrollLeft += direction === "left" ? speed : -speed

            // The list is rendered twice, so wrapping at the halfway point is
            // invisible to the eye.
            if (el.scrollLeft >= half) el.scrollLeft -= half
            else if (el.scrollLeft <= 0) el.scrollLeft += half
        }

        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [direction, speed, destinations.length])

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
            onMouseEnter={hold}
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
            className="flex gap-6 md:gap-8 overflow-x-auto cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
            {[...destinations, ...destinations].map((dest, i) => (
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
