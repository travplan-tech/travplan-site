import { Metadata } from "next"
import Hero from "@/components/hero"
import HomeClient from "./HomeClient"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "Travplan Tour Packages | Group Trips & Custom Holidays" },
  description:
    "Book curated India and international tour packages with Travplan. Explore group departures, custom holidays, expert support and easy WhatsApp enquiries.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Travplan Tour Packages | Group Trips & Custom Holidays",
    description:
      "Book curated India and international tour packages with Travplan. Explore group departures, custom holidays and expert travel support.",
    url: "/",
    type: "website",
    // Page-level openGraph replaces the root layout's, so the image is restated
    images: ["/og-image.jpg"],
  },
}

// Schema.org structured data for the homepage
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Travplan",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.webp`,
        width: 200,
        height: 200,
      },
      sameAs: [
        "https://www.instagram.com/Travplan.in",
        "https://wa.me/917011990884",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-7011990884",
        contactType: "customer service",
        email: "Info@Travplan.in",
        availableLanguage: ["English", "Hindi"],
        areaServed: "IN",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Travplan",
      description:
        "Curated India and international tour packages, group departures and custom holidays.",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/tours?country={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "TravelAgency",
      "@id": `${SITE_URL}/#travelagency`,
      name: "Travplan",
      url: SITE_URL,
      priceRange: "$$-$$$",
      telephone: "+91-7011990884",
      email: "Info@Travplan.in",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Workingdom, Block A, Sector 7 Dwarka, Palam",
        addressLocality: "New Delhi",
        addressRegion: "Delhi",
        postalCode: "110077",
        addressCountry: "IN",
      },
      // No aggregateRating here: a self-serving rating on the business itself is
      // not eligible for review stars. Ratings belong on individual packages,
      // sourced from real reviews.
      areaServed: "IN",
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
