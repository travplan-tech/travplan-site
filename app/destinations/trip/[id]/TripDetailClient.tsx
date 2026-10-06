"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    Download,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Info,
    MapPin,
    Star,
    Users,
    X,
} from "lucide-react";
import {
    TourDetailsFooterSkeleton,
    TourAvailabilitySkeleton,
    CardGridSkeleton,
} from "@/components/loading-skeletons";
import { readableTitle } from "@/lib/package-title";
import PackageOverview from "@/components/package-overview";
import PackageSection from "@/components/package-section";
import PackageItinerary from "@/components/package-itinerary";

// Dynamic Imports for below-the-fold content
const TourDetailsFooter = dynamic(() => import("@/components/tripdetails"), {
    loading: () => <TourDetailsFooterSkeleton />,
});
const TourAvailabilitySection = dynamic(() => import("@/components/tripavailability"), {
    loading: () => <TourAvailabilitySkeleton />,
});
const TopRatedSection = dynamic(() => import("@/components/top-rated"), {
    loading: () => <CardGridSkeleton cards={3} />,
});
const EnquiryDialog = dynamic(() => import("@/components/EnquiryDialog"));
const BrochureDialog = dynamic(() => import("@/components/BrochureDialog"));
const FavoriteButton = dynamic(() => import("@/components/FavoriteButton"));

// Types
interface Review {
    id: number;
    user: {
        name: string | null;
        image: string | null;
    };
    rating: number;
    comment: string | null;
    createdAt: string;
}

interface DepartureDate {
    date: string;
    seatsRemaining?: number | null;
}

export interface TourData {
    id: number;
    title: string;
    tags: string[];
    description: string | null;
    price: number;
    originalPrice: number | null;
    duration: string;
    rating: number;
    reviewCount: number;
    image: string | null;
    mapImage: string | null;
    priceChartImage?: string | null;
    galleryImages: string[];
    highlights: string[];
    itinerary: Array<{
        day: number;
        title: string;
        duration?: string;
        description: string;
        altitude?: string;
        showAccommodation?: boolean;
    }>;
    tourType: string | null;
    tourCategory?: string;
    maxPersons?: number;
    ageRange: string | null;
    accommodation: string | null;
    destinations: string[];
    departurePoints: string[];
    inclusions: string[];
    exclusions: string[];
    itineraryPdf: string | null;
    isCustomizable: boolean;
    bestPrice: boolean;
    flightsIncluded: boolean;
    specialNotes?: string | null;
    cancellationPolicy?: string | null;
    upcomingDepartures?: DepartureDate[];
    reviews?: Review[];
    destination: {
        name: string;
        country: string | null;
    };
}

interface TripDetailClientProps {
    tourData: TourData;
}

export default function TripDetailClient({ tourData }: TripDetailClientProps) {
    const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);
    const [showBrochureDialog, setShowBrochureDialog] = useState(false);

    const mainImage = tourData.image || "/placeholder.jpg";
    const galleryImages = tourData.galleryImages.length > 0
        ? tourData.galleryImages
        : [mainImage, mainImage];

    // Alt text for the two side images. Uses the readable title rather than the
    // stored "Kerala-7N/8D" form, and tidies destination names that carry a
    // stray space before the comma ("Kerala , India").
    const galleryAltPlace = (tourData.destination?.name || "")
        .replace(/\s+,/g, ",")
        .trim();
    const galleryAltBase = [readableTitle(tourData.title, tourData.duration), galleryAltPlace]
        .filter(Boolean)
        .join(" in ");

    // "Tawang, India" -> "Tawang · India", with the stray space tidied.
    // destination.name arrives as "Tawang, India"; show it as "Tawang · India".
    const destinationLabel =
        (tourData.destination?.name || "")
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .join(" · ") || null;

    return (
        <div className="bg-white">
            {/* --- Full-Width Gallery/Hero Section --- */}
            <div className="relative w-full overflow-hidden mb-4 md:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
                    {/* Main Large Image */}
                    <div className="md:col-span-3 h-[250px] sm:h-[300px] md:h-[400px] relative overflow-hidden rounded-lg">
                        <Image
                            src={mainImage}
                            alt={tourData.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 60vw"
                            priority
                            className="object-cover"
                        />
                        <FavoriteButton
                            packageId={tourData.id}
                            size="md"
                            className="absolute top-2 md:top-4 right-2 md:right-4"
                        />
                        {/* Download Brochure Button */}
                        {tourData.itineraryPdf && (
                            <button
                                onClick={() => setShowBrochureDialog(true)}
                                className="absolute bottom-3 md:bottom-6 left-4 md:left-8 text-white text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 bg-primary hover:bg-primary/90 rounded-full flex items-center shadow-lg transition"
                            >
                                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Download Brochure
                            </button>
                        )}
                    </div>

                    {/* Side Image Column */}
                    <div className="md:col-span-2 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                        <div className="flex-1 md:flex-none h-[150px] sm:h-[180px] md:h-[195px] relative overflow-hidden rounded-lg">
                            <Image
                                src={galleryImages[0] || mainImage}
                                alt={`${galleryAltBase} photo 1`}
                                fill
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 md:flex-none h-[150px] sm:h-[180px] md:h-[195px] relative overflow-hidden rounded-lg">
                            <Image
                                src={galleryImages[1] || mainImage}
                                alt={`${galleryAltBase} photo 2`}
                                fill
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Container --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- Breadcrumbs and Title --- */}
                <nav aria-label="Breadcrumb" className="mb-4 md:mb-5">
                    <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                        <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                        <li><Link href="/destinations" className="hover:text-primary transition-colors">Destinations</Link></li>
                        {tourData.destination?.country && (
                            <>
                                <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                                <li>
                                    <Link
                                        href={`/destinations?country=${encodeURIComponent(tourData.destination.country)}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {tourData.destination.country}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ol>
                </nav>

                {destinationLabel && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-3">
                        <MapPin size={13} aria-hidden="true" />
                        {destinationLabel}
                    </p>
                )}

                <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                    {readableTitle(tourData.title, tourData.duration)}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-4 mb-6 md:mb-8">
                    {tourData.duration && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                            <Clock size={12} aria-hidden="true" />
                            {tourData.duration}
                        </span>
                    )}
                    {tourData.tourCategory && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                            <Users size={12} aria-hidden="true" />
                            {tourData.tourCategory === "GROUP" ? "Group tour" : "Private tour"}
                        </span>
                    )}
                    {/* Shown only when the trip genuinely has reviews */}
                    {typeof tourData.rating === "number" && tourData.rating > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                            <Star size={12} className="fill-amber-500 text-amber-500" aria-hidden="true" />
                            {tourData.rating.toFixed(1)}
                            {tourData.reviewCount ? (
                                <span className="font-medium text-amber-700/70">
                                    ({tourData.reviewCount} reviews)
                                </span>
                            ) : null}
                        </span>
                    )}
                </div>

                {/* --- Content/Sidebar Split --- */}
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
                    {/* LEFT/MIDDLE COLUMN - Tour Details (Part 1: Up to Route Map) */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1">
                        {tourData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tourData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <PackageOverview
                            duration={tourData.duration}
                            tourType={tourData.tourType}
                            tourCategory={tourData.tourCategory}
                            maxPersons={tourData.maxPersons}
                            ageRange={tourData.ageRange}
                            flightsIncluded={tourData.flightsIncluded}
                            accommodation={tourData.accommodation}
                            isCustomizable={tourData.isCustomizable}
                            departurePoints={tourData.departurePoints}
                            destinationName={tourData.destination?.name}
                            cities={tourData.destinations}
                        />

                        {/* --- Route Map Section --- */}
                        {tourData.mapImage && (
                            <div className="py-3 md:py-4">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                                    Route Map
                                </h2>
                                <div className="relative bg-gray-100 h-64 sm:h-80 md:h-96 w-full rounded-lg flex items-center justify-center">
                                    <Image
                                        src={tourData.mapImage}
                                        alt="Route Map"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                        loading="lazy"
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN - Booking Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:row-span-2">
                        <div className="lg:sticky lg:top-20 bg-white border border-gray-200 rounded-lg p-4 md:p-5 lg:p-6 shadow-lg">
                            {/* Price and Availability */}
                            <div className="mb-4 md:mb-6">
                                {tourData.originalPrice && tourData.originalPrice > tourData.price && (
                                    <p className="text-sm text-gray-400 line-through">
                                        ₹{tourData.originalPrice.toLocaleString("en-IN")}
                                    </p>
                                )}
                                <p className="text-xs md:text-sm text-gray-500">From</p>
                                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                                    ₹{tourData.price.toLocaleString("en-IN")}
                                </p>
                                <p className="text-xs text-gray-500">per person</p>
                            </div>

                            <Link href="#availability">
                                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 md:py-3 rounded-md mb-2 md:mb-3 transition text-sm md:text-base">
                                    Check Availability
                                </button>
                            </Link>
                            <button
                                onClick={() => setShowEnquiryDialog(true)}
                                className="w-full bg-white border border-primary text-primary hover:bg-primary/5 font-semibold py-2.5 md:py-3 rounded-md transition text-sm md:text-base"
                            >
                                Make an Enquiry
                            </button>

                            {/* Guarantees and Benefits */}
                            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200 space-y-2 md:space-y-3">
                                {tourData.bestPrice && (
                                    <div className="flex items-center text-xs md:text-sm text-gray-700">
                                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                        Best price guaranteed
                                    </div>
                                )}
                                <div className="flex items-center text-xs md:text-sm text-gray-700">
                                    <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                    Book your package at 30% Now
                                </div>
                                <div className="flex items-center text-xs md:text-sm text-gray-700">
                                    <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                    EMI options available
                                </div>
                                {tourData.isCustomizable && (
                                    <div className="flex items-center text-xs md:text-sm text-gray-700">
                                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 shrink-0" />
                                        Trip is customizable
                                    </div>
                                )}
                            </div>

                            {/* Child Policy Notice */}
                            <div className="mt-4 pt-3 md:pt-4 border-t border-gray-200">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs md:text-sm text-amber-800">
                                        <span className="font-semibold">Child Policy:</span> Children aged 6-12 years may incur additional charges. Children below 6 years are complimentary.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LEFT/MIDDLE COLUMN - Tour Details (Part 2: After Route Map) */}
                    <div className="lg:col-span-2 space-y-7 md:space-y-9 order-3">
                        {/* --- About --- */}
                        {tourData.description && (
                            <PackageSection title="About this trip" bordered={false}>
                                <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                                    {tourData.description}
                                </p>
                            </PackageSection>
                        )}

                        {/* --- Highlights --- */}
                        {tourData.highlights.length > 0 && (
                            <PackageSection title="Trip highlights">
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {tourData.highlights.map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5"
                                        >
                                            <span className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                                                <Check size={14} strokeWidth={3} aria-hidden="true" />
                                            </span>
                                            <span className="text-sm text-gray-700 leading-relaxed min-w-0">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </PackageSection>
                        )}

                        {/* --- Itinerary --- */}
                        {tourData.itinerary.length > 0 && (
                            <PackageSection title="Day-by-day itinerary" eyebrow="The plan">
                                <PackageItinerary
                                    days={tourData.itinerary}
                                    accommodation={tourData.accommodation}
                                />
                            </PackageSection>
                        )}

                        {/* --- Inclusions & Exclusions --- */}
                        {(tourData.inclusions.length > 0 || tourData.exclusions.length > 0) && (
                            <PackageSection title="What's included">
                                <div className="grid md:grid-cols-2 gap-4 md:gap-5 items-start">
                                    {tourData.inclusions.length > 0 && (
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3">
                                                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                                                </span>
                                                Included
                                            </h3>
                                            <ul className="space-y-2.5">
                                                {tourData.inclusions.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                        <Check
                                                            size={15}
                                                            className="text-emerald-600 shrink-0 mt-0.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="min-w-0 leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {tourData.exclusions.length > 0 && (
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                                <span className="w-6 h-6 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
                                                    <X size={14} strokeWidth={3} aria-hidden="true" />
                                                </span>
                                                Not included
                                            </h3>
                                            <ul className="space-y-2.5">
                                                {tourData.exclusions.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                        <X
                                                            size={15}
                                                            className="text-gray-400 shrink-0 mt-0.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="min-w-0 leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </PackageSection>
                        )}

                        {/* --- Special Notes --- */}
                        {tourData.specialNotes && (
                            <PackageSection title="Good to know">
                                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
                                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-sm md:text-base text-amber-900 whitespace-pre-line leading-relaxed min-w-0">
                                        {tourData.specialNotes}
                                    </p>
                                </div>
                            </PackageSection>
                        )}

                        {/* Reviews Section */}
                        <TourDetailsFooter
                            title={tourData.title}
                            itineraryPdf={tourData.itineraryPdf}
                            reviews={tourData.reviews || []}
                            rating={tourData.rating}
                            reviewCount={tourData.reviewCount}
                            onDownloadBrochure={() => setShowBrochureDialog(true)}
                        />

                        {/* Availability Section */}
                        <TourAvailabilitySection
                            departureDates={tourData.upcomingDepartures || []}
                            departurePoints={tourData.departurePoints}
                            price={tourData.price}
                            originalPrice={tourData.originalPrice || undefined}
                            discountPercent={tourData.originalPrice && tourData.originalPrice > tourData.price
                                ? Math.round(((tourData.originalPrice - tourData.price) / tourData.originalPrice) * 100)
                                : 0}
                            duration={tourData.duration}
                            title={tourData.title}
                            destination={tourData.destination?.name}
                            packageId={tourData.id}
                            priceChartImage={tourData.priceChartImage}
                            cancellationPolicy={tourData.cancellationPolicy || undefined}
                        />
                    </div>
                </div>
                <TopRatedSection />
            </div>

            {/* Enquiry Dialog - Conditionally Rendered by dynamic import */}
            {showEnquiryDialog && (
                <EnquiryDialog
                    isOpen={showEnquiryDialog}
                    onClose={() => setShowEnquiryDialog(false)}
                    packageId={tourData.id}
                    packageName={tourData.title}
                />
            )}

            {/* Brochure Dialog - Conditionally Rendered by dynamic import */}
            {showBrochureDialog && (
                <BrochureDialog
                    isOpen={showBrochureDialog}
                    onClose={() => setShowBrochureDialog(false)}
                    packageId={tourData.id}
                    packageName={tourData.title}
                    brochureUrl={tourData.itineraryPdf}
                />
            )}
        </div>
    );
}
