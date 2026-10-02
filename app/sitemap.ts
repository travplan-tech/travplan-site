import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { SITE_URL } from "@/lib/site"

// The sitemap is built from live package/destination data, so refresh it hourly
// instead of freezing whatever existed at build time.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/destinations`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/tours`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/trip-planner`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ]

    // Active sale pages (/deals/[slug]); there is no bare /deals route.
    let dealPages: MetadataRoute.Sitemap = []
    try {
        const sales = await prisma.sale.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        })
        dealPages = sales.map((sale) => ({
            url: `${baseUrl}/deals/${sale.slug}`,
            lastModified: sale.updatedAt,
            changeFrequency: "daily" as const,
            priority: 0.8,
        }))
    } catch (error) {
        console.error("Error fetching sales for sitemap:", error)
    }

    // Fetch all packages for dynamic sitemap entries
    let packagePages: MetadataRoute.Sitemap = []
    try {
        const packages = await prisma.package.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        packagePages = packages.map((pkg) => ({
            url: `${baseUrl}/destinations/trip/${pkg.id}`,
            lastModified: pkg.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }))
    } catch (error) {
        console.error("Error fetching packages for sitemap:", error)
    }

    // Fetch destinations for country-based pages
    let destinationPages: MetadataRoute.Sitemap = []
    try {
        const destinations = await prisma.destination.findMany({
            select: {
                country: true,
                updatedAt: true,
            },
            where: {
                country: {
                    not: null,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        // Get unique countries
        const uniqueCountries = new Map<string, Date>()
        destinations.forEach((dest) => {
            if (dest.country) {
                const existing = uniqueCountries.get(dest.country)
                if (!existing || dest.updatedAt > existing) {
                    uniqueCountries.set(dest.country, dest.updatedAt)
                }
            }
        })

        destinationPages = Array.from(uniqueCountries.entries()).map(
            ([country, updatedAt]) => ({
                url: `${baseUrl}/destinations?country=${encodeURIComponent(country)}`,
                lastModified: updatedAt,
                changeFrequency: "weekly" as const,
                priority: 0.7,
            })
        )
    } catch (error) {
        console.error("Error fetching destinations for sitemap:", error)
    }

    return [...staticPages, ...dealPages, ...packagePages, ...destinationPages]
}
