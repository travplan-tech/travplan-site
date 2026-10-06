/**
 * Consistent section wrapper for the package detail page, so every block below
 * the overview shares one heading rhythm instead of each styling its own.
 */
export default function PackageSection({
    title,
    eyebrow,
    children,
    bordered = true,
}: {
    title: string
    eyebrow?: string
    children: React.ReactNode
    bordered?: boolean
}) {
    return (
        <section className={bordered ? "pt-7 md:pt-9 border-t border-gray-200" : ""}>
            {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
                    {eyebrow}
                </p>
            )}
            <h2 className="font-heading text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-4 md:mb-5">
                {title}
            </h2>
            {children}
        </section>
    )
}
