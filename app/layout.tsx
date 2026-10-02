import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Providers } from "./providers";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Travplan Tour Packages | Group Trips & Custom Holidays",
    template: "%s | Travplan",
  },
  description:
    "Book curated India and international tour packages with Travplan. Explore group departures, custom holidays, expert support and easy WhatsApp enquiries.",
  keywords: [
    "tours",
    "travel packages",
    "vacation packages",
    "adventure tours",
    "multiday tours",
    "group tours",
    "private tours",
    "travel deals",
    "holiday packages",
    "destination tours",
    "international travel",
    "domestic tours",
    "customized trips",
    "travel booking",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: "Travplan",
  publisher: "Travplan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Travplan Tour Packages | Group Trips & Custom Holidays",
    description:
      "Book curated India and international tour packages with Travplan. Explore group departures, custom holidays, expert support and easy WhatsApp enquiries.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Travplan - Your Gateway to Amazing Travel Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travplan Tour Packages | Group Trips & Custom Holidays",
    description:
      "Book curated India and international tour packages with Travplan. Explore group departures, custom holidays, expert support and easy WhatsApp enquiries.",
    images: ["/og-image.jpg"],
    creator: "@Travplan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

// Fetch active sale data server-side
async function getActiveSale() {
  noStore(); // Prevent caching - always fetch fresh sale data
  try {
    const activeSale = await prisma.sale.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { name: true, slug: true }
    });
    return activeSale;
  } catch (error) {
    console.error("Error fetching active sale:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSR: Fetch active sale data
  const activeSale = await getActiveSale();

  return (
    <html lang="en">
      <body className="font-body antialiased">
        <Providers>
          <LayoutWrapper header={<Header initialActiveSale={activeSale} />} footer={<Footer />}>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
