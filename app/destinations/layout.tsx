// Metadata for this route lives in page.tsx's generateMetadata, because titles,
// descriptions and canonicals depend on the ?country= / ?region= search params,
// which a layout cannot read.
export default function DestinationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
