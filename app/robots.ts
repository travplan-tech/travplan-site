import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_URL

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // /_next/ must stay crawlable: blocking it stops non-Google
                // crawlers from fetching the JS/CSS they need to render pages.
                disallow: [
                    "/admin/",
                    "/api/",
                    "/checkout/",
                    "/profile/",
                    "/auth/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/admin/", "/api/", "/checkout/", "/profile/", "/auth/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
