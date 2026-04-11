import { Metadata } from "next"
import Hero from "@/components/hero"
import HomeClient from "./HomeClient"

export const metadata: Metadata = {
  title: "Book Tours & Travel Experiences Worldwide",
  description:
    "Discover and book the best tours, trips, and travel experiences globally. Compare 15,000+ curated multiday tours in 130+ countries. Best prices guaranteed with 100% carbon offset.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Travplan - Book Tours & Travel Experiences Worldwide",
    description:
      "Discover and book the best tours, trips, and travel experiences globally. Compare 15,000+ curated multiday tours with verified reviews.",
    url: "/",
    type: "website",
  },
}

// Schema.org structured data for the homepage
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://travel-1-plan.vercel.app/#organization",
      name: "Travplan",
      url: "https://travel-1-plan.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://travel-1-plan.vercel.app/logo.webp",
        width: 200,
        height: 200,
      },
      sameAs: [
        "https://www.facebook.com/Travplan",
        "https://www.instagram.com/Travplan",
        "https://twitter.com/Travplan",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+45-8897-6045",
        contactType: "customer service",
        email: "Info@Travplan.in",
        availableLanguage: ["English"],
        areaServed: "Worldwide",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://travel-1-plan.vercel.app/#website",
      url: "https://travel-1-plan.vercel.app",
      name: "Travplan",
      description:
        "Discover and book the best tours, trips, and travel experiences globally.",
      publisher: {
        "@id": "https://travel-1-plan.vercel.app/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://travel-1-plan.vercel.app/tours?country={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "TravelAgency",
      "@id": "https://travel-1-plan.vercel.app/#travelagency",
      name: "Travplan",
      url: "https://travel-1-plan.vercel.app",
      priceRange: "$$-$$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Skovlunden 18",
        addressLocality: "Ry",
        postalCode: "8680",
        addressCountry: "DK",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "10000",
        bestRating: "5",
        worstRating: "1",
      },
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: "0",
          longitude: "0",
        },
        geoRadius: "40075000",
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full">
        {/* Hero loads immediately - above the fold */}
        <Hero />
        {/* Below-the-fold components loaded via HomeClient */}
        <HomeClient />
      </main>
    </>
  )
}
