import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { SITE_URL, SITE_NAME } from "@/lib/site"
import BlogContent from "@/components/blog-content"

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
    try {
        const blogs = await prisma.blog.findMany({
            where: { isPublished: true },
            select: { slug: true },
        })
        return blogs.map((b) => ({ slug: b.slug }))
    } catch (error) {
        console.error("generateStaticParams (blogs) failed", error)
        return []
    }
}

// Shared between generateMetadata and the page so the row is fetched once.
const getBlog = cache(async (slug: string) => {
    try {
        return await prisma.blog.findFirst({
            where: { slug, isPublished: true },
            include: {
                destination: { select: { id: true, name: true, city: true, country: true } },
            },
        })
    } catch (error) {
        console.error("Error loading blog post:", error)
        return null
    }
})

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const blog = await getBlog(slug)

    if (!blog) {
        return { title: "Guide Not Found" }
    }

    const title = blog.metaTitle || `${blog.title} | Travplan`
    const description =
        blog.metaDescription ||
        blog.excerpt ||
        `${blog.title} — a travel guide from Travplan.`

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: `/blog/${blog.slug}` },
        openGraph: {
            title,
            description,
            url: `/blog/${blog.slug}`,
            type: "article",
            publishedTime: blog.publishedAt?.toISOString(),
            images: blog.coverImage ? [blog.coverImage] : ["/og-image.jpg"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: blog.coverImage ? [blog.coverImage] : ["/og-image.jpg"],
        },
    }
}

function formatDate(date: Date | null) {
    if (!date) return null
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const blog = await getBlog(slug)

    if (!blog) notFound()

    const place = blog.destination?.city?.trim().replace(/\s*,\s*$/, "") || null
    const tags = (blog.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${SITE_URL}/blog/${blog.slug}#article`,
        headline: blog.title,
        description: blog.metaDescription || blog.excerpt || undefined,
        image: blog.coverImage || `${SITE_URL}/og-image.jpg`,
        datePublished: blog.publishedAt?.toISOString(),
        dateModified: blog.updatedAt.toISOString(),
        author: { "@type": "Organization", name: blog.author, url: SITE_URL },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.webp` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${blog.slug}` },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="w-full bg-white">
                {/* Full-bleed hero: the photograph carries the title */}
                <div className="relative w-full h-[340px] sm:h-[420px] md:h-[520px] bg-gray-900">
                    {blog.coverImage && (
                        <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                    )}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25"
                        aria-hidden="true"
                    />

                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 md:pb-14">
                        <nav aria-label="Breadcrumb" className="mb-auto pt-6">
                            <ol className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap">
                                <li>
                                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                </li>
                                <ChevronRight size={14} className="text-white/40 shrink-0" aria-hidden="true" />
                                <li>
                                    <Link href="/blog" className="hover:text-white transition-colors">
                                        Travel Guides
                                    </Link>
                                </li>
                            </ol>
                        </nav>

                        {place && (
                            <p className="inline-flex items-center gap-1.5 self-start bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full mb-4">
                                <MapPin size={12} aria-hidden="true" />
                                {place}
                            </p>
                        )}

                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-4xl drop-shadow-lg">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80 mt-5">
                            <span>{blog.author}</span>
                            {blog.publishedAt && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={14} aria-hidden="true" />
                                    {formatDate(blog.publishedAt)}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={14} aria-hidden="true" />
                                {blog.readingMinutes} min read
                            </span>
                        </div>
                    </div>
                </div>

                {/* Article on the left, a sticky summary card on the right */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-14 items-start">
                        <article className="min-w-0">
                            {blog.excerpt && (
                                <p className="text-lg md:text-xl text-gray-700 leading-relaxed border-l-4 border-primary/30 pl-5 mb-9">
                                    {blog.excerpt}
                                </p>
                            )}
                            <BlogContent content={blog.content} />
                        </article>

                        <aside className="lg:sticky lg:top-24 space-y-4">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                <h2 className="text-sm font-bold text-gray-900 mb-4">At a glance</h2>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Clock size={15} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                                        <div>
                                            <dt className="text-gray-500 text-xs">Read time</dt>
                                            <dd className="font-semibold text-gray-900">
                                                {blog.readingMinutes} minutes
                                            </dd>
                                        </div>
                                    </div>
                                    {blog.publishedAt && (
                                        <div className="flex items-start gap-3">
                                            <Calendar size={15} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                                            <div>
                                                <dt className="text-gray-500 text-xs">Published</dt>
                                                <dd className="font-semibold text-gray-900">
                                                    {formatDate(blog.publishedAt)}
                                                </dd>
                                            </div>
                                        </div>
                                    )}
                                    {place && (
                                        <div className="flex items-start gap-3">
                                            <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                                            <div>
                                                <dt className="text-gray-500 text-xs">Destination</dt>
                                                <dd className="font-semibold text-gray-900">{place}</dd>
                                            </div>
                                        </div>
                                    )}
                                </dl>

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-gray-100">
                                        {tags.slice(0, 5).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {blog.destination && (
                                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-2">
                                        Plan this trip
                                    </p>
                                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                                        See our {place || blog.destination.name} trips
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1.5">
                                        Compare itineraries, durations and prices.
                                    </p>
                                    <Link
                                        href={`/destinations/trip?destination=${blog.destination.id}`}
                                        className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors mt-4 text-sm"
                                    >
                                        View trips
                                        <ChevronRight size={16} aria-hidden="true" />
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
        </>
    )
}
