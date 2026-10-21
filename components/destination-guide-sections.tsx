import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Clock, MapPin, Ticket, Wallet } from "lucide-react"
import SectionHeading from "@/components/section-heading"
import type { DestinationGuide } from "@/lib/destination-content"
import type { DestinationBlogCard, DestinationRow } from "@/lib/destination-page-data"

/**
 * The written half of a destination page, below the trips.
 *
 * Server components with no client JavaScript: this is the content a crawler
 * needs to see, so none of it may depend on hydration. Headings come from the
 * shared SectionHeading so these blocks sit in the same rhythm as the trips and
 * travel-style sections above them, rather than reading as an article bolted on
 * to the bottom of the page.
 */

const SHELL = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

export function DestinationIntro({
    name,
    guide,
    tripCount,
    fromPrice,
}: {
    name: string
    guide: DestinationGuide
    tripCount: number
    fromPrice: number | null
}) {
    const [lead, ...rest] = guide.intro

    return (
        <section id="about" className="scroll-mt-24 py-14 md:py-20 bg-gray-50">
            <div className={SHELL}>
                <SectionHeading eyebrow="About" title={`${name} travel guide`} subtitle={lead} />

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
                    <div className="space-y-5 max-w-3xl">
                        {rest.map((para) => (
                            <p key={para} className="text-base md:text-lg leading-relaxed text-gray-700">
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* Figures come from live inventory, never from the guide
                        text, so this panel cannot contradict the trips above. */}
                    {tripCount > 0 && (
                        <aside className="rounded-2xl border border-gray-200 bg-white p-6 h-fit">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                                At a glance
                            </p>
                            <dl className="mt-5 space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Ticket className="h-4 w-4 text-primary" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            {tripCount === 1 ? "Package" : "Packages"}
                                        </dt>
                                        <dd className="text-xl font-bold text-gray-900">{tripCount}</dd>
                                    </div>
                                </div>
                                {fromPrice !== null && (
                                    <div className="flex items-start gap-3.5">
                                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                            <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <dt className="text-sm text-gray-500">Starting from</dt>
                                            <dd className="text-xl font-bold text-gray-900">
                                                ₹{fromPrice.toLocaleString("en-IN")}
                                            </dd>
                                        </div>
                                    </div>
                                )}
                            </dl>
                            <p className="mt-6 border-t border-gray-100 pt-5 text-sm leading-relaxed text-gray-600">
                                Every {name} itinerary is customisable to your dates, budget and pace.
                            </p>
                        </aside>
                    )}
                </div>
            </div>
        </section>
    )
}

export function BestTimeToVisit({ name, paragraphs }: { name: string; paragraphs: string[] }) {
    return (
        <section id="best-time" className="scroll-mt-24 py-14 md:py-20">
            <div className={SHELL}>
                <SectionHeading eyebrow="When to go" title={`Best time to visit ${name}`} />

                <div className="grid gap-5 md:grid-cols-2">
                    {paragraphs.map((para) => (
                        <div
                            key={para}
                            className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7"
                        >
                            <CalendarDays
                                className="h-5 w-5 text-primary mb-4"
                                aria-hidden="true"
                            />
                            <p className="text-base md:text-[17px] leading-relaxed text-gray-700">
                                {para}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function ThingsToDo({ name, items }: { name: string; items: DestinationGuide["thingsToDo"] }) {
    return (
        <section id="things-to-do" className="scroll-mt-24 py-14 md:py-20 bg-gray-50">
            <div className={SHELL}>
                <SectionHeading
                    eyebrow="Highlights"
                    title={`Top things to do in ${name}`}
                    subtitle={`The places most ${name} itineraries are built around.`}
                />

                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => (
                        <li
                            key={item.title}
                            className="group relative rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-primary/40 hover:shadow-md"
                        >
                            <span
                                aria-hidden="true"
                                className="font-heading text-4xl font-bold leading-none text-gray-200 transition group-hover:text-primary/30"
                            >
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mt-4 font-heading text-lg font-bold text-gray-900">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{item.blurb}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export function DaysNeeded({ name, text }: { name: string; text: string }) {
    return (
        <section id="how-long" className="scroll-mt-24 py-14 md:py-20">
            <div className={SHELL}>
                <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-12">
                    <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary mb-3">
                        <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
                        Trip length
                    </p>
                    <h2 className="font-heading text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight max-w-3xl">
                        How many days do you need in {name}?
                    </h2>
                    <div className="mt-6 flex items-start gap-4 max-w-3xl">
                        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                        </span>
                        <p className="text-base md:text-lg leading-relaxed text-gray-700">{text}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function DestinationGuideFaqs({ name, faqs }: { name: string; faqs: DestinationGuide["faqs"] }) {
    return (
        <section id="faqs" className="scroll-mt-24 py-14 md:py-20 bg-gray-50">
            <div className={SHELL}>
                <SectionHeading
                    eyebrow="FAQs"
                    title={`${name} questions, answered`}
                    subtitle={`The things people ask us most before booking a ${name} trip.`}
                />

                {/* <details> rather than a JS accordion: the answers stay in the
                    HTML and remain expandable with JavaScript unavailable. */}
                <div className="max-w-3xl space-y-3">
                    {faqs.map((faq) => (
                        <details
                            key={faq.q}
                            className="group rounded-2xl border border-gray-200 bg-white px-6 py-5 transition hover:border-primary/40 open:border-primary/40"
                        >
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-heading text-base md:text-lg font-bold text-gray-900 marker:content-['']">
                                <span>{faq.q}</span>
                                <span
                                    aria-hidden="true"
                                    className="mt-0.5 shrink-0 text-2xl leading-none text-primary transition-transform duration-200 group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="mt-4 text-[15px] md:text-base leading-relaxed text-gray-600">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function DestinationBlogs({ name, blogs }: { name: string; blogs: DestinationBlogCard[] }) {
    if (blogs.length === 0) return null
    return (
        <section id="reading" className="scroll-mt-24 py-14 md:py-20">
            <div className={SHELL}>
                <SectionHeading
                    eyebrow="Travel guides"
                    title={`Reading on ${name}`}
                    subtitle={`Longer pieces from our team on planning a ${name} trip.`}
                    action={{ href: "/blog", label: "All travel guides" }}
                />

                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((post) => (
                        <li key={post.slug} className="group">
                            <Link
                                href={`/blog/${post.slug}`}
                                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-primary/40 hover:shadow-md"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                                    {post.coverImage && (
                                        <Image
                                            src={post.coverImage}
                                            alt=""
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition duration-300 group-hover:scale-[1.04]"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="font-heading text-lg font-bold leading-snug text-gray-900 group-hover:text-primary">
                                        {post.title}
                                    </h3>
                                    {post.excerpt && (
                                        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-gray-600">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <p className="mt-auto pt-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                                        {post.readingMinutes} min read
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export function SiblingDestinations({
    country,
    siblings,
}: {
    country: string | null
    siblings: DestinationRow[]
}) {
    if (siblings.length === 0) return null
    return (
        <section className="py-14 md:py-20 border-t border-gray-100">
            <div className={SHELL}>
                <SectionHeading
                    eyebrow="Explore more"
                    title={country ? `More destinations in ${country}` : "More destinations"}
                    action={{ href: "/destinations", label: "All destinations" }}
                />

                <ul className="flex flex-wrap gap-3">
                    {siblings.map((d) => (
                        <li key={d.id}>
                            <Link
                                href={`/destinations/${d.slug}`}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-[15px] font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                            >
                                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                                {d.city || d.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
