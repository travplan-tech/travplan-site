import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://travel-1-plan.vercel.app"

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/api/",
                    "/checkout/",
                    "/profile/",
                    "/auth/",
                    "/_next/",
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
