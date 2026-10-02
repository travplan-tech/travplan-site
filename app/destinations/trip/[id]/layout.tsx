// Metadata for this route is produced by page.tsx's generateMetadata, which
// reuses its cached package query. This layout previously ran a second
// generateMetadata with its own database lookup; page-level metadata takes
// precedence, so that work was duplicated and its title never shipped.
export default function TourDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
