import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const revalidate = 300

export const metadata: Metadata = {
    title: { absolute: "Travel Guides & Trip Planning Blog | Travplan" },
    description:
        "Travel guides from Travplan — itineraries, trip costs, permits and the best time to visit destinations across India and abroad.",
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Travel Guides & Trip Planning Blog | Travplan",
        description:
            "Itineraries, trip costs, permits and the best time to visit destinations across India and abroad.",
        url: "/blog",
        type: "website",
        images: ["/og-image.jpg"],
    },
}

function formatDate(date: Date | null) {
    if (!date) return null
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function BlogIndexPage() {
    let blogs: Awaited<ReturnType<typeof prisma.blog.findMany>> = []
    try {
        blogs = await prisma.blog.findMany({
            where: { isPublished: true },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        })
    } catch (error) {
        console.error("Error loading blog index:", error)
    }

    return (
        <main className="w-full bg-white">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-12 md:pb-16">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary mb-3">
                    Travel Guides
                </p>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                    Trip planning, made simpler
                </h1>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mt-4">
                    Itineraries, real trip costs, permits and the best time to go — written by our
                    team from the trips we actually run.
                </p>

                {blogs.length === 0 ? (
                    <p className="text-gray-500 mt-12">No guides published yet. Check back soon.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-14">
                        {blogs.map((blog) => (
                            <article
                                key={blog.id}
                                className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow"
                            >
                                <Link href={`/blog/${blog.slug}`} className="block">
                                    <div className="relative w-full h-52 bg-gray-100">
                                        {blog.coverImage ? (
                                            <Image
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="p-5">
                                        <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                                            {blog.title}
                                        </h2>
                                        {blog.excerpt && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{blog.excerpt}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                                            {blog.publishedAt && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar size={13} aria-hidden="true" />
                                                    {formatDate(blog.publishedAt)}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock size={13} aria-hidden="true" />
                                                {blog.readingMinutes} min read
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
