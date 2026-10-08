"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowUpRight, IndianRupee } from "lucide-react"
import { useGetBudgetStatsQuery } from "@/lib/api/packagesApi"
import SectionHeading from "@/components/section-heading"

interface BudgetRange {
    label: string
    maxPrice: number
    count: number
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
            { label: "10,000", maxPrice: 10000, count: 0 },
            { label: "20,000", maxPrice: 20000, count: 0 },
            { label: "30,000", maxPrice: 30000, count: 0 },
            { label: "50,000", maxPrice: 50000, count: 0 },
        ],
    },
    {
        key: "international",
        label: "Abroad",
        blurb: "Short-haul escapes and long-haul holidays from India.",
        tours: 0,
        ranges: [
            { label: "30,000", maxPrice: 30000, count: 0 },
            { label: "50,000", maxPrice: 50000, count: 0 },
            { label: "75,000", maxPrice: 75000, count: 0 },
            { label: "1,00,000", maxPrice: 100000, count: 0 },
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
                        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
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
                                className={`group relative flex flex-col justify-between rounded-2xl border p-5 md:p-6 min-h-36 md:min-h-44 transition-all ${empty
                                    ? "border-gray-200 bg-gray-50/60 hover:border-gray-300"
                                    : "border-gray-200 bg-white hover:border-primary hover:-translate-y-0.5 hover:shadow-lg"
                                    }`}
                            >
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Under</p>
                                    <p className="flex items-start text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none">
                                        <IndianRupee
                                            size={18}
                                            className="mt-0.5 mr-0.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {range.label}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between gap-2 mt-5">
                                    <span
                                        className={`text-sm font-medium ${empty ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {empty
                                            ? "None yet"
                                            : `${range.count} ${range.count === 1 ? "trip" : "trips"}`}
                                    </span>
                                    <ArrowUpRight
                                        size={18}
                                        aria-hidden="true"
                                        className={`shrink-0 transition-transform ${empty
                                            ? "text-gray-300"
                                            : "text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            }`}
                                    />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
