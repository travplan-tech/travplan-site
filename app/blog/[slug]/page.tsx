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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 md:pt-8 md:pb-20">
                    <nav aria-label="Breadcrumb" className="mb-6">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                            <li>
                                <Link href="/blog" className="hover:text-primary transition-colors">
                                    Travel Guides
                                </Link>
                            </li>
                        </ol>
                    </nav>

                    <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mt-5">
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

                    {blog.coverImage && (
                        <div className="relative w-full h-60 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 mt-8">
                            <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 768px"
                                className="object-cover"
                            />
                        </div>
                    )}

                    <article className="mt-10">
                        <BlogContent content={blog.content} />
                    </article>

                    {/* Send readers to the trips this guide is about */}
                    {blog.destination && (
                        <aside className="mt-14 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">
                                <MapPin size={13} aria-hidden="true" />
                                Plan this trip
                            </p>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                See our {place || blog.destination.name} trips
                            </h2>
                            <p className="text-sm md:text-base text-gray-600 mt-2">
                                Compare itineraries, durations and prices, or tell us what you want and
                                we will plan it around you.
                            </p>
                            <Link
                                href={`/destinations/trip?destination=${blog.destination.id}`}
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors mt-5"
                            >
                                View {place || blog.destination.name} trips
                                <ChevronRight size={18} aria-hidden="true" />
                            </Link>
                        </aside>
                    )}
                </div>
            </main>
        </>
    )
}
