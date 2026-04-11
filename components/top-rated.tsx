"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import BrochureDialog from "@/components/BrochureDialog";
import { useGetPackagesQuery } from "@/lib/api/packagesApi";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Package {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice: number | null;
  duration: string;
  discountPercent: number | null;
  itineraryPdf: string | null;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
    );
  }

  while (stars.length < 5) {
    stars.push(<Star key={stars.length} size={14} className="text-gray-300" />);
  }

  return <div className="flex items-center space-x-0.5">{stars}</div>;
};

export default function TopRated() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  // IntersectionObserver to detect when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // RTK Query hook - only fetch when in view
  const { data: packagesData, isLoading: loading } = useGetPackagesQuery(
    { sortBy: "rating", limit: 6 },
    { skip: !isInView }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = packagesData as any;
  const packages: Package[] = Array.isArray(rawData)
    ? rawData
    : rawData?.packages || [];

  const [brochureDialog, setBrochureDialog] = useState<{
    isOpen: boolean;
    packageId: number;
    packageName: string;
    brochureUrl: string | null;
  }>({ isOpen: false, packageId: 0, packageName: "", brochureUrl: null });

  if (loading || !isInView) {
    return (
      <section ref={sectionRef} className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Top Header and Navigation --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Last-Minute <span className="text-primary">Deals</span>
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-1.5">
              Last-minute deals for the best deals. Book now and save big.
            </p>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto">
            {/* View all button */}
            <Link href="/tours?sortBy=rating" className="text-primary font-semibold hover:underline text-sm md:text-base whitespace-nowrap">
              See all deals
            </Link>
          </div>
        </div>

        {/* --- Carousel --- */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full px-1"
          >
            <CarouselContent>
              {packages.map((pkg) => {
                const reviewCount = pkg.reviewCount || 0;
                const discount = pkg.originalPrice
                  ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                  : pkg.discountPercent || 0;

                return (
                  // Carousel Item: 1 on mobile (basis-full), 2 on md, 3 on lg
                  <CarouselItem key={pkg.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4 py-2">
                    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition duration-300 flex flex-col h-full">
                      {/* Image Area */}
                      <div className="relative w-full aspect-4/3 overflow-hidden">
                        <Image
                          src={pkg.image || "/placeholder.jpg"}
                          alt={pkg.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Favorite Button */}
                        <FavoriteButton
                          packageId={pkg.id}
                          size="sm"
                          className="absolute top-3 left-3 z-10"
                        />
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {discount}% OFF TODAY
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 md:p-5 flex flex-col grow">
                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                          {pkg.title} | {pkg.duration}
                        </h3>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2 mb-3">
                          <RatingStars rating={pkg.rating} />
                          <span className="text-sm font-semibold text-gray-900">
                            {pkg.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-primary">
                            ({reviewCount} reviews)
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed grow">
                          {pkg.description || "Discover an unforgettable journey with our expertly curated tour package."}
                        </p>

                        {/* Price Section */}
                        <div className="flex items-end justify-between mb-4 mt-auto">
                          <span className="text-sm text-gray-500">{pkg.duration}</span>
                          <div className="text-right">
                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                              <span className="text-sm text-gray-400 line-through block">
                                INR {pkg.originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                            <span className="text-xl font-bold text-gray-900">
                              INR {pkg.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-auto">
                          <button
                            onClick={() => setBrochureDialog({
                              isOpen: true,
                              packageId: pkg.id,
                              packageName: pkg.title,
                              brochureUrl: pkg.itineraryPdf
                            })}
                            className="flex-1 py-2.5 px-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            Get Brochure
                          </button>
                          <Link
                            href={`/destinations/trip/${pkg.id}`}
                            className="flex-1 py-2.5 px-2 bg-primary/10 text-primary rounded-lg text-xs font-medium text-center hover:bg-primary/20 transition-colors whitespace-nowrap flex items-center justify-center"
                          >
                            View Tour
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {/* Mobile Navigation (Below) */}
            <div className="flex justify-center gap-4 mt-6 lg:hidden">
              <CarouselPrevious className="static w-12 h-12 translate-y-0" />
              <CarouselNext className="static w-12 h-12 translate-y-0" />
            </div>
            {/* Desktop Navigation (Sides) */}
            <div className={packages.length <= 3 ? "hidden" : "hidden lg:block"}>
              <CarouselPrevious className="-left-16 w-12 h-12" />
              <CarouselNext className="-right-16 w-12 h-12" />
            </div>
          </Carousel>
        </div>

        <BrochureDialog
          isOpen={brochureDialog.isOpen}
          onClose={() => setBrochureDialog({ ...brochureDialog, isOpen: false })}
          packageId={brochureDialog.packageId}
          packageName={brochureDialog.packageName}
          brochureUrl={brochureDialog.brochureUrl}
        />
      </div>
    </section>
  );
}
