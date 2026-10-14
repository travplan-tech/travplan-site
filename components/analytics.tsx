"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { GA_ID, GTM_ID, analyticsEnabled, track, trackPageView } from "@/lib/analytics"

/**
 * Loads the analytics tag and reports client-side navigations.
 *
 * Renders nothing when no measurement id is configured, so the site ships no
 * third-party script until someone sets one.
 */
/**
 * Counts WhatsApp and phone clicks with one delegated listener.
 *
 * Those links are scattered across the footer, expert cards, the trip planner
 * and the contact page. Patching each call site would miss any added later,
 * so this listens once on the document and reads the href.
 */
function OutboundClicks() {
    useEffect(() => {
        if (!analyticsEnabled) return

        const onClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement | null)?.closest?.("a")
            const href = link?.getAttribute("href") || ""
            if (href.includes("wa.me") || href.startsWith("whatsapp:")) {
                track("whatsapp_click", { link_url: href, page: window.location.pathname })
            } else if (href.startsWith("tel:")) {
                track("phone_click", { link_url: href, page: window.location.pathname })
            }
        }

        document.addEventListener("click", onClick, { capture: true })
        return () => document.removeEventListener("click", onClick, { capture: true })
    }, [])

    return null
}

function PageViews() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!analyticsEnabled) return
        const query = searchParams?.toString()
        trackPageView(query ? `${pathname}?${query}` : pathname)
    }, [pathname, searchParams])

    return null
}

export default function Analytics() {
    if (!analyticsEnabled) return null

    return (
        <>
            {GA_ID && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga-init" strategy="afterInteractive">
                        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
// Routing is handled by PageViews below, so the tag does not also count
// its own page_view on every soft navigation.
gtag('config', '${GA_ID}', { send_page_view: false });`}
                    </Script>
                </>
            )}

            {GTM_ID && !GA_ID && (
                <Script id="gtm-init" strategy="afterInteractive">
                    {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
                </Script>
            )}

            {/* useSearchParams needs a Suspense boundary to keep pages static. */}
            <OutboundClicks />

            <Suspense fallback={null}>
                <PageViews />
            </Suspense>
        </>
    )
}
