"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
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
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  duration: string;
  rating: number;
  reviewCount?: number;
  image: string | null;
  destination?: {
    country: string | null;
  };
  itineraryPdf: string | null;
}

interface BestToursProps {
  country?: string | null;
  region?: string | null;
  saleSlug?: string | null;
  tourCategory?: string | null;
  excludeCountry?: string | null;
  tourType?: string | null;
  destinationId?: number;
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

export default function BestTours({ country, region, saleSlug, tourCategory, excludeCountry, tourType, destinationId }: BestToursProps) {
  const [brochureDialog, setBrochureDialog] = useState<{
    isOpen: boolean;
    packageId: number;
    packageName: string;
    brochureUrl: string | null;
  }>({ isOpen: false, packageId: 0, packageName: "", brochureUrl: null });

  // RTK Query hook with filters
  const { data: packagesData, isLoading } = useGetPackagesQuery({
    country: country || undefined,
    region: region || undefined,
    saleSlug: saleSlug || undefined,
    tourCategory: tourCategory || undefined,
    excludeCountry: excludeCountry || undefined,
    tourType: tourType || undefined,
    destinationId: destinationId || undefined,
    limit: 6
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = packagesData as any;
  const packages: Package[] = Array.isArray(rawData)
    ? rawData.slice(0, 6)
    : rawData?.packages?.slice(0, 6) || [];

  const displayName = saleSlug
    ? "Sale"
    : tourType
      ? tourType
      : tourCategory
        ? (tourCategory === "PRIVATE" ? "Private" : "Group")
        : excludeCountry
          ? "International"
          : (country || region || "World");

  // Build Explore All Link
  const exploreParams = new URLSearchParams();
  if (country) exploreParams.set("country", country);
  if (region) exploreParams.set("region", region);
  if (saleSlug) exploreParams.set("saleSlug", saleSlug);
  if (tourCategory) exploreParams.set("tourCategory", tourCategory);
  if (excludeCountry) exploreParams.set("excludeCountry", excludeCountry);
  if (tourType) exploreParams.set("tourType", tourType);

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- Top Header and Navigation --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Best {displayName} Tours
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-1.5">
                Explore our top-rated tours {country ? `in ${country}` : region ? `across ${region}` : "worldwide"} — handpicked for unforgettable experiences!
              </p>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto">
              {/* Explore All Link */}
              <Link
                href={`/tours?${exploreParams.toString()}`}
                className="text-primary font-semibold hover:underline text-sm md:text-base whitespace-nowrap"
              >
                Explore All Tours →
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-4/3 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Tour Deals Carousel --- */}
          {!isLoading && packages.length > 0 && (
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

                    return (
                      <CarouselItem key={pkg.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4 py-2">
                        <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition duration-300 h-full flex flex-col">
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
                            {(pkg.discountPercent || 0) > 0 && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                {pkg?.discountPercent}% OFF TODAY
                              </div>
                            )}
                          </div>

                          {/* Content Area */}
                          <div className="p-4 md:p-5 flex flex-col grow">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
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
                            <p className="text-sm text-gray-600 mb-4 line-clamp-5 leading-relaxed grow">
                              {pkg.description || `${pkg.title} - Discover an unforgettable journey with our expertly curated tour package featuring the best experiences and accommodations.`}
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
                                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Get Trip Brochure
                              </button>
                              <Link
                                href={`/destinations/trip/${pkg.id}`}
                                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center hover:bg-primary/20 bg-primary/10 text-primary transition-colors"
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
                  <CarouselPrevious className="static translate-y-0 w-12 h-12" />
                  <CarouselNext className="static translate-y-0 w-12 h-12" />
                </div>
                {/* Desktop Navigation (Sides) */}
                <div className={packages.length <= 3 ? "hidden" : "hidden lg:block"}>
                  <CarouselPrevious className="-left-16 w-12 h-12" />
                  <CarouselNext className="-right-16 w-12 h-12" />
                </div>
              </Carousel>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && packages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tours available for this destination yet.</p>
              <Link href="/destinations" className="text-primary hover:underline mt-2 inline-block">
                Browse all destinations
              </Link>
            </div>
          )}
        </div>
      </section>
      <BrochureDialog
        isOpen={brochureDialog.isOpen}
        onClose={() => setBrochureDialog(prev => ({ ...prev, isOpen: false }))}
        packageId={brochureDialog.packageId}
        packageName={brochureDialog.packageName}
        brochureUrl={brochureDialog.brochureUrl}
      />
    </>
  );
}
