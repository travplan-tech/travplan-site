"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import Link from "next/link"

interface DestinationHeroProps {
  country?: string | null
  region?: string | null
  title?: string
  description?: string
  image?: string
}

export default function DestinationHero({ country, region, title, description, image }: DestinationHeroProps) {
  const displayName = title || country || region || "Explore"
  const subtitle = description || (country
    ? `${country} has a complex history that shapes much of its modern life. We recommend visiting the cultural religious and historic sites, including a tour of the local heritage. Head North for a boat cruise, or visit the capital city to discover its temples, museums and delicious street food.`
    : region
      ? `Explore incredible destinations across ${region}. From historic sites to modern marvels, discover the unique culture and landscapes that make this region special.`
      : "Discover rich adventure and culture around the world. Find the perfect tour for your next holiday.")

  const bgImage = image || "/mountain-lake-landscape.jpg"

  return (
    <section className="w-full bg-white pb-6 pt-2">
      {/* Wider container */}
      <div className="max-w-[98%] mx-auto">
        <div style={{backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat"}} className="relative w-full rounded-[32px] overflow-hidden shadow-2xl bg-gray-200">
          {/* Gradient Overlay - slightly reduced opacity for visibility */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-black/25" />

          {/* Content */}
          <div className="flex flex-col items-center justify-center text-center text-white p-6 md:p-12">

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-xl tracking-tight max-w-5xl">
              {title || `${displayName} Tours & Trips`}
            </h1>

            {/* Removed Review Line as requested */}

            {/* Description */}
            <p className="text-base md:text-xl text-gray-100 max-w-4xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
              {subtitle}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl">
              <button className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/40 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300">
                <Link href="#customize-trip">Talk to a Travel Advisor</Link>
              </button>
            </div>

            {/* Bottom Features Bar - Generic/Dynamic-safe */}
            <div className="flex mt-5 flex-wrap justify-center gap-4 md:gap-12 text-xs md:text-sm font-semibold text-white/90 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="bg-primary rounded-full p-0.5">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="bg-primary rounded-full p-0.5">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span>Verified Customer Reviews</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="bg-primary rounded-full p-0.5">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span>Wide Selection of Tours</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
