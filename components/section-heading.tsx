import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * Shared heading for the featured destination page sections, so every block
 * uses the same eyebrow / title / subtitle rhythm.
 */
export default function SectionHeading({
    eyebrow,
    title,
    subtitle,
    action,
    align = "left",
}: {
    eyebrow?: string
    title: string
    subtitle?: string
    action?: { href: string; label: string }
    align?: "left" | "center"
}) {
    const centered = align === "center"

    return (
        <div
            className={`flex flex-col gap-4 mb-8 md:mb-10 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
                }`}
        >
            <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
                {eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
                        {eyebrow}
                    </p>
                )}
                <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">{subtitle}</p>
                )}
            </div>

            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm md:text-base hover:gap-2.5 transition-all whitespace-nowrap"
                >
                    {action.label}
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            )}
        </div>
    )
}
