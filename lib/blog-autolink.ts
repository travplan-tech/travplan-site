/**
 * Turns the first mention of a destination or package into a link.
 *
 * Posts were written as flat prose with no internal links, so a reader who
 * hits "Spiti Valley" four paragraphs in has no way through to the trips.
 * Rather than editing the markdown — which would need redoing for every new
 * post and goes stale when a destination is renamed — this runs over the
 * rendered tree.
 *
 * Working on the tree rather than the markdown string matters: a regex over
 * markdown would happily rewrite the inside of an existing link, a URL, or a
 * code span. Here, those nodes are skipped by element name and never seen.
 *
 * Each term links once per post. Linking every mention reads as keyword
 * stuffing and is the thing search engines penalise, which is the opposite of
 * what the links are for.
 */

export interface AutolinkTerm {
    /** The phrase to match, case-insensitively. */
    text: string
    href: string
}

/** Elements whose text must be left alone. */
const SKIP = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"])

interface Node {
    type: string
    tagName?: string
    value?: string
    children?: Node[]
    properties?: Record<string, unknown>
}

export function rehypeAutolink(terms: AutolinkTerm[]) {
    // Longest first, so "Spiti Valley" wins over "Spiti".
    const ordered = [...terms].sort((a, b) => b.text.length - a.text.length)

    return () => (tree: Node) => {
        const used = new Set<string>()

        const walk = (node: Node) => {
            if (!node.children) return

            const out: Node[] = []
            for (const child of node.children) {
                if (child.type === "element" && SKIP.has(child.tagName || "")) {
                    out.push(child)
                    continue
                }
                if (child.type !== "text" || !child.value) {
                    walk(child)
                    out.push(child)
                    continue
                }

                let text = child.value
                let replaced = false

                for (const term of ordered) {
                    if (used.has(term.href)) continue
                    // Word boundaries, so "Goa" does not match inside "Goan".
                    const pattern = new RegExp(
                        `\\b(${term.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`,
                        "i"
                    )
                    const match = pattern.exec(text)
                    if (!match) continue

                    const before = text.slice(0, match.index)
                    const after = text.slice(match.index + match[0].length)
                    if (before) out.push({ type: "text", value: before })
                    out.push({
                        type: "element",
                        tagName: "a",
                        properties: { href: term.href },
                        children: [{ type: "text", value: match[0] }],
                    })
                    used.add(term.href)
                    text = after
                    replaced = true
                }

                if (!replaced) out.push(child)
                else if (text) out.push({ type: "text", value: text })
            }
            node.children = out
        }

        walk(tree)
    }
}

/**
 * The terms a post should link: every destination, plus the trips belonging to
 * the one it is about.
 *
 * Packages are limited to the post's own destination on purpose. Matching all
 * 44 titles against every post would link a Kerala trip out of a Spiti article
 * because both contain the word "Expedition", and a wrong link is worse than
 * no link.
 */
export function buildAutolinkTerms({
    destinations,
    packages,
}: {
    destinations: { name: string; city: string | null; slug: string }[]
    packages: { id: number; title: string }[]
}): AutolinkTerm[] {
    const terms: AutolinkTerm[] = []
    const seen = new Set<string>()

    const add = (text: string, href: string) => {
        const key = text.toLowerCase()
        // Too short to be unambiguous — "Goa" is fine, two letters is not.
        if (text.length < 4 || seen.has(key)) return
        seen.add(key)
        terms.push({ text, href })
    }

    for (const d of destinations) {
        const href = `/destinations/${d.slug}`
        if (d.city) add(d.city, href)
        add(d.name.replace(/,.*$/, "").trim(), href)
    }
    for (const p of packages) add(p.title, `/destinations/trip/${p.id}`)

    return terms
}
