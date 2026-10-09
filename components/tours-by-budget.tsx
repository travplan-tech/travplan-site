"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, IndianRupee } from "lucide-react"
import { useGetBudgetStatsQuery } from "@/lib/api/packagesApi"
import SectionHeading from "@/components/section-heading"

interface BudgetRange {
    label: string
    maxPrice: number
    count: number
    image: string
}

interface BudgetGroup {
    key: "domestic" | "international"
    label: string
    blurb: string
    tours: number
    ranges: BudgetRange[]
}

const DEFAULT_GROUPS: BudgetGroup[] = [
    {
        key: "domestic",
        label: "In India",
        blurb: "Himalayan valleys, backwaters, deserts and the North East.",
        tours: 0,
        ranges: [
            { label: "10,000", maxPrice: 10000, count: 0, image: "/mountain-forest.jpg" },
            { label: "20,000", maxPrice: 20000, count: 0, image: "/spiti-valley-mountains.jpg" },
            { label: "30,000", maxPrice: 30000, count: 0, image: "/kerala-backwaters.jpg" },
            { label: "50,000", maxPrice: 50000, count: 0, image: "/arunachal-pradesh-mountains.jpg" },
        ],
    },
    {
        key: "international",
        label: "Abroad",
        blurb: "Short-haul escapes and long-haul holidays from India.",
        tours: 0,
        ranges: [
            { label: "30,000", maxPrice: 30000, count: 0, image: "/thailand-beach.jpg" },
            { label: "50,000", maxPrice: 50000, count: 0, image: "/nepal-kathmandu-himalaya.jpg" },
            { label: "75,000", maxPrice: 75000, count: 0, image: "/buddhist-temple-golden-pagoda.jpg" },
            { label: "1,00,000", maxPrice: 100000, count: 0, image: "/venice-italy-canal.jpg" },
        ],
    },
]

export default function ToursByBudget() {
    const sectionRef = useRef<HTMLElement>(null)
    const [isInView, setIsInView] = useState(false)
    const [active, setActive] = useState<"domestic" | "international">("domestic")

    useEffect(() => {
        const rafId = requestAnimationFrame(() => {
            const element = sectionRef.current
            if (!element) return
            if (element.getBoundingClientRect().top < window.innerHeight) {
                setIsInView(true)
                return
            }
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        observer.disconnect()
                    }
                },
                { rootMargin: "100px" }
            )
            observer.observe(element)
        })
        return () => cancelAnimationFrame(rafId)
    }, [])

    const { data: budgetData } = useGetBudgetStatsQuery(undefined, { skip: !isInView })

    const groups = DEFAULT_GROUPS.map((group) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (budgetData as any)?.[group.key]
        if (!stats) return group
        return {
            ...group,
            tours: stats.totalTours || 0,
            ranges: group.ranges.map((range) => ({
                ...range,
                count: stats.budgetCounts?.[range.maxPrice] || 0,
            })),
        }
    })

    const current = groups.find((g) => g.key === active) || groups[0]

    return (
        <section ref={sectionRef} className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8 md:mb-10">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
                            Budget
                        </p>
                        <h2 className="font-heading text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 tracking-tight">
                            Trips that fit what you want to spend
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 mt-2">{current.blurb}</p>
                    </div>

                    {/* One control for both groups, instead of two separate cards */}
                    <div className="inline-flex shrink-0 rounded-xl bg-gray-100 p-1">
                        {groups.map((group) => (
                            <button
                                key={group.key}
                                type="button"
                                onClick={() => setActive(group.key)}
                                aria-pressed={active === group.key}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${active === group.key
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                {group.label}
                                {group.tours > 0 && (
                                    <span
                                        className={`ml-1.5 text-xs font-medium ${active === group.key ? "text-gray-400" : "text-gray-400"
                                            }`}
                                    >
                                        {group.tours}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price ladder: numbers lead, no image headers */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {current.ranges.map((range) => {
                        const href = `/tours?maxPrice=${range.maxPrice}${active === "domestic" ? "&type=domestic" : "&type=international"
                            }`
                        const empty = range.count === 0

                        return (
                            <Link
                                key={range.maxPrice}
                                href={href}
                                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl min-h-44 md:min-h-56 p-5 transition-transform hover:-translate-y-0.5"
                            >
                                <Image
                                    src={range.image}
                                    alt=""
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${empty ? "grayscale opacity-60" : ""
                                        }`}
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
                                    aria-hidden="true"
                                />

                                <div className="relative">
                                    <p className="text-xs font-medium text-white/70 mb-1">Under</p>
                                    <p className="flex items-start text-2xl md:text-3xl font-bold text-white tracking-tight leading-none drop-shadow">
                                        <IndianRupee
                                            size={18}
                                            className="mt-0.5 mr-0.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {range.label}
                                    </p>

                                    <div className="flex items-end justify-between gap-2 mt-4 pt-3 border-t border-white/20">
                                        <span className="text-sm font-medium text-white/85">
                                            {empty
                                                ? "None yet"
                                                : `${range.count} ${range.count === 1 ? "trip" : "trips"}`}
                                        </span>
                                        <ArrowUpRight
                                            size={18}
                                            aria-hidden="true"
                                            className="shrink-0 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
