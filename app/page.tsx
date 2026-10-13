import { Metadata } from "next"
import Hero from "@/components/hero"
import HomeClient from "./HomeClient"
import { SITE_URL } from "@/lib/site"
import {
  getBudgetStats,
  getDestinations,
  getFeatureBoxes,
  getHomepageSettings,
  getTourTypeStats,
  getVideoReviews,
  getExperts,
} from "@/lib/home-data"

// Prerendered at build time and rebuilt in the background every 5 minutes, so
// a visitor is never waiting on the database. Next.js reads this statically, so
// it has to be a literal and cannot reference PAGE_REVALIDATE.
export const revalidate = 300

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
    images: ["https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1920,c_limit/v1791880449/TravPlan/site/og-image.jpg"],
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

export default async function Home() {
  // Deliberately sequential. Issuing all six at once needs six connections,
  // and the database allows only 20 across every build worker and running
  // instance; overshooting makes the queries fail and an empty homepage gets
  // prerendered. These are cached, so the cost is paid once per revalidation,
  // not per request.
  const budgetStats = await getBudgetStats()
  const tourTypeStats = await getTourTypeStats()
  const destinations = await getDestinations()
  const featureBoxes = await getFeatureBoxes()
  const homepageSettings = await getHomepageSettings()
  const videoReviews = await getVideoReviews()
  // The homepage opens on the domestic team, so only those are needed up front.
  const experts = await getExperts({ type: "DOMESTIC" })

  // A build that cannot read the database would otherwise prerender a homepage
  // with zeroed counts and no testimonials, exit 0, and deploy silently. Fail
  // the build instead: a failed deploy is recoverable, a live empty homepage
  // cached for the revalidation window is not. At request time the page still
  // degrades gracefully, falling back to client-side fetching.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    const missing = Object.entries({ budgetStats, destinations, tourTypeStats })
      .filter(([, value]) => value === null)
      .map(([name]) => name)

    if (missing.length > 0) {
      throw new Error(
        `Refusing to prerender the homepage without ${missing.join(", ")}. ` +
        `The database was unreachable during the build — most likely its ` +
        `connection limit. Retry the deploy once connections free up.`
      )
    }
  }

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
        <HomeClient
          data={{
            // null means the load failed, so drop the prop and let the
            // section fetch client-side instead of showing an empty one.
            budgetStats: budgetStats ?? undefined,
            tourTypeStats: tourTypeStats ?? undefined,
            destinations: destinations ?? undefined,
            featureBoxes: featureBoxes ?? undefined,
            homepageSettings: homepageSettings ?? undefined,
            videoReviews: videoReviews ?? undefined,
            experts: experts ?? undefined,
          }}
        />
      </main>
    </>
  )
}
