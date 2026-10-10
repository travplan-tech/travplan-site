"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { MapPin, MessageCircle } from "lucide-react"

export interface ExpertCard {
    id: number
    name: string
    bio?: string | null
    avatar?: string | null
    expertise?: string[] | string | null
    whatsappNumber?: string | null
}

/**
 * Expert cards that drift sideways on their own and stay draggable.
 *
 * The drift animates scrollLeft on the same element the visitor can drag, and
 * the position is kept as a float because browsers round scrollLeft to whole
 * pixels, which would otherwise swallow a sub-pixel step and freeze the row.
 */
export default function ExpertCarousel({
    experts,
    namedIds = [],
    place,
    speed = 0.35,
}: {
    experts: ExpertCard[]
    /** Ids of the destination's own experts, badged in the card */
    namedIds?: number[]
    place?: string | null
    speed?: number
}) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const pausedUntil = useRef(0)
    const dragging = useRef(false)
    const dragStart = useRef({ x: 0, scroll: 0 })
    const position = useRef(0)

    // Repeat enough that a short list still overflows and has room to move.
    const copies = experts.length === 0 ? 1 : Math.max(2, Math.ceil(8 / experts.length) * 2)
    const items = Array.from({ length: copies }, () => experts).flat()

    useEffect(() => {
        const el = scrollRef.current
        if (!el || experts.length === 0) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        position.current = el.scrollLeft
        let frame = 0
        const step = () => {
            frame = requestAnimationFrame(step)
            if (!el) return
            if (dragging.current || Date.now() < pausedUntil.current) {
                position.current = el.scrollLeft
                return
            }
            const span = el.scrollWidth / copies
            if (span <= 0 || el.scrollWidth <= el.clientWidth) return

            position.current += speed
            if (position.current >= span * (copies - 1)) position.current -= span
            else if (position.current <= 0) position.current += span
            el.scrollLeft = position.current
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [experts.length, copies, speed])

    const hold = () => {
        pausedUntil.current = Date.now() + 2000
    }

    if (experts.length === 0) return null

    return (
        <div
            ref={scrollRef}
            onWheel={hold}
            onTouchStart={hold}
            onTouchMove={hold}
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
            className="flex gap-4 md:gap-5 overflow-x-auto cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
            {items.map((expert, i) => {
                const tags = Array.isArray(expert.expertise)
                    ? expert.expertise
                    : (expert.expertise || "").split(",").map((t) => t.trim()).filter(Boolean)
                const isNamed = namedIds.includes(expert.id)

                return (
                    <article
                        key={`${expert.id}-${i}`}
                        className="shrink-0 w-[260px] sm:w-[300px] rounded-2xl border border-gray-200 bg-white overflow-hidden"
                    >
                        <div className="relative h-44 sm:h-52 bg-gray-100">
                            {expert.avatar ? (
                                <Image
                                    src={expert.avatar}
                                    alt={expert.name}
                                    fill
                                    draggable={false}
                                    sizes="300px"
                                    className="object-cover object-top"
                                />
                            ) : null}
                            {isNamed && place && (
                                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                    <MapPin size={10} aria-hidden="true" />
                                    {place} expert
                                </span>
                            )}
                        </div>

                        <div className="p-4">
                            <p className="font-bold text-gray-900 truncate">{expert.name}</p>
                            {expert.bio && (
                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mt-1">
                                    {expert.bio}
                                </p>
                            )}

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {tags.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {expert.whatsappNumber && (
                                <a
                                    href={`https://wa.me/${expert.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                                        place
                                            ? `Hi ${expert.name}, I am planning a trip to ${place}. Can you help?`
                                            : `Hi ${expert.name}, I am planning a trip. Can you help?`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    draggable={false}
                                    className="flex items-center justify-center gap-1.5 w-full bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors mt-4"
                                >
                                    <MessageCircle size={15} aria-hidden="true" />
                                    Chat on WhatsApp
                                </a>
                            )}
                        </div>
                    </article>
                )
            })}
        </div>
    )
}
