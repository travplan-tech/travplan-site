// Metadata for this route lives in page.tsx's generateMetadata, because the
// title, description and indexing rules depend on the ?search= and filter
// search params, which a layout cannot read.
export default function ToursLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
