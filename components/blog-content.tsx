"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"
import Image from "next/image"
import { rehypeAutolink, type AutolinkTerm } from "@/lib/blog-autolink"

/**
 * Renders a post's markdown body. Element styling is declared here rather than
 * through a typography plugin so the classes are generated like any other
 * Tailwind utility in this project.
 */
export default function BlogContent({
    content,
    autolink = [],
}: {
    content: string
    /** Destinations and packages to link on first mention. */
    autolink?: AutolinkTerm[]
}) {
    return (
        <div className="text-gray-700">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={autolink.length ? [rehypeAutolink(autolink)] : []}
                components={{
                    h2: ({ children }) => (
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-4 scroll-mt-24">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-9 mb-3">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-lg font-semibold text-gray-900 mt-7 mb-2">{children}</h4>
                    ),
                    p: ({ children, node }) => {
                        // Markdown wraps a standalone image in a paragraph.
                        // A <figure> inside a <p> is invalid HTML and the
                        // browser closes the <p> early, which breaks hydration
                        // — so an image-only paragraph renders unwrapped.
                        const onlyChild = node?.children?.length === 1 ? node.children[0] : null
                        const isImageOnly =
                            onlyChild && "tagName" in onlyChild && onlyChild.tagName === "img"
                        if (isImageOnly) return <>{children}</>
                        return <p className="text-base md:text-lg leading-relaxed mb-5">{children}</p>
                    },
                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-2 mb-6 text-base md:text-lg">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-2 mb-6 text-base md:text-lg">{children}</ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/40 bg-gray-50 pl-5 pr-4 py-3 my-6 rounded-r-lg text-gray-700">
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => {
                        const url = href || "#"
                        const isInternal = url.startsWith("/")
                        if (isInternal) {
                            return (
                                <Link href={url} className="text-primary font-medium underline underline-offset-2 hover:text-primary/80">
                                    {children}
                                </Link>
                            )
                        }
                        return (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
                            >
                                {children}
                            </a>
                        )
                    },
                    // Cost tables are a core part of these posts, so they get a
                    // proper scroll container on narrow screens.
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-8 rounded-xl border border-gray-200">
                            <table className="w-full text-left text-sm md:text-base border-collapse">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                    th: ({ children }) => (
                        <th className="px-4 py-3 font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 border-b border-gray-100 align-top">{children}</td>
                    ),
                    img: ({ src, alt, title }) => {
                        const url = typeof src === "string" ? src : ""
                        if (!url) return null
                        // The alt text doubles as the caption, so a post never
                        // carries an image that is unlabelled for a screen
                        // reader but captioned for everyone else.
                        const caption = title || alt
                        return (
                            <figure className="my-9">
                                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
                                    <Image
                                        src={url}
                                        alt={alt || ""}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 768px"
                                        className="object-cover"
                                    />
                                </div>
                                {caption && (
                                    <figcaption className="mt-2.5 text-sm text-gray-500 text-center">
                                        {caption}
                                    </figcaption>
                                )}
                            </figure>
                        )
                    },
                    hr: () => <hr className="my-10 border-gray-200" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
