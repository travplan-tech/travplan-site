import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Providers } from "./providers";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export const metadata: Metadata = {
  metadataBase: new URL("https://travel-1-plan.vercel.app"),
  title: {
    default: "Travplan - Book Tours & Travel Experiences Worldwide",
    template: "%s | Travplan",
  },
  description:
    "Discover and book the best tours, trips, and travel experiences globally. Compare 15,000+ curated multiday tours in 130+ countries with verified reviews, best prices, and carbon-offset travel.",
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
  authors: [{ name: "Travplan", url: "https://travel-1-plan.vercel.app" }],
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
    url: "https://travel-1-plan.vercel.app",
    siteName: "Travplan",
    title: "Travplan - Book Tours & Travel Experiences Worldwide",
    description:
      "Discover and book the best tours, trips, and travel experiences globally. Compare 15,000+ curated multiday tours with verified reviews and best prices.",
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
    title: "Travplan - Book Tours & Travel Experiences Worldwide",
    description:
      "Discover and book the best tours, trips, and travel experiences globally. Compare 15,000+ curated multiday tours with verified reviews and best prices.",
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
  alternates: {
    canonical: "https://travel-1-plan.vercel.app",
  },
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
